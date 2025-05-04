import jscanify from 'jscanify';
import * as ort from 'onnxruntime-node';
import sharp from 'sharp';
import cv from '@techstark/opencv-js';
import { loadImage } from 'canvas';
import { pdf as pdfToImg } from 'pdf-to-img';
import { Downloader } from 'nodejs-file-downloader';

import { AI_MODEL_DOWNLOAD_URL, AI_MODEL_NAME } from '../config.js';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class DocumentPreprocessorService {
    private readonly pdfMimeTypes: string[] = ['application/pdf'];
    private readonly imageMimeTypes: string[] = ['image/jpeg', 'image/png'];

    private readonly scanner = new jscanify();
    private openCVLoaded: boolean = false;
    private aiModel: ort.InferenceSession | null = null;

    public async loadOpenCV(): Promise<void> {
        if (!this.openCVLoaded) {
            await new Promise<void>((resolve) => {
                this.scanner.loadOpenCV(() => {
                    this.openCVLoaded = true;
                    resolve();
                });
            });
        }
    }

    /**
     * Converts PDF pages to an array of images
     * @param pdf PDF of a document
     * @returns images of PDF pages
     */
    async convertPdfToImg(pdf: Buffer): Promise<Buffer[]> {
        const document = await pdfToImg(pdf, { scale: 3 });
        const images: Buffer[] = [];
        for await (const image of document) {
            images.push(image);
        }
        return images;
    }

    async extractDocumentFromPhotoWithImgProcessing(
        photo: Buffer,
        imageWidth: number,
        imageHeight: number,
    ): Promise<Buffer> {
        await this.loadOpenCV();
        const imageForExtraction = await loadImage(photo);
        return this.scanner.extractPaper(imageForExtraction, imageWidth, imageHeight).toBuffer('image/png');
    }

    private async downloadAIModel(): Promise<void> {
        if (!fs.existsSync(join(__dirname, 'ai_model'))) {
            fs.mkdirSync(join(__dirname, 'ai_model'));
        }

        if (!fs.existsSync(join(__dirname, 'ai_model', AI_MODEL_NAME))) {
            const downloader = new Downloader({
                url: AI_MODEL_DOWNLOAD_URL,
                directory: join(__dirname, 'ai_model'),
                fileName: AI_MODEL_NAME,
                onProgress: function (percentage) {
                    console.log(`${percentage}%`);
                },
            });

            console.log('Downloading ai model');
            await downloader.download();
        }
    }

    async getAIModel(): Promise<ort.InferenceSession> {
        if (!this.aiModel) {
            await this.downloadAIModel();
            this.aiModel = await ort.InferenceSession.create(join(__dirname, 'ai_model', AI_MODEL_NAME));
        }
        return this.aiModel;
    }

    // convenience function for debugging
    private async saveImage(
        mat: cv.Mat,
        fileName: string,
        width: number,
        height: number,
        channels: number,
    ): Promise<void> {
        let buff = Buffer.alloc(0);
        if (channels == 3) {
            buff = await sharp(mat.data, {
                raw: {
                    width: width,
                    height: height,
                    channels: 3,
                },
            })
                .png()
                .toBuffer();
        } else if (channels == 1) {
            buff = await sharp(mat.data, {
                raw: {
                    width: width,
                    height: height,
                    channels: 1,
                },
            })
                .grayscale()
                .png()
                .toBuffer();
        }

        fs.writeFileSync(join(__dirname, '..', '..', 'ocr_outputs', fileName), buff);
    }

    private async padImageToMakeSquare(photo: Buffer, width: number, height: number): Promise<cv.Mat> {
        const mat = cv.matFromArray(height, width, cv.CV_8UC3, photo);

        // adding padding for 2 reasons:
        // 1. To make image square so when its resized aspect ratio is conserved
        // 2. Additional padding is added by amount of pixels paddingOffset because
        //    if borders of document are near border of picture the AI model will not
        //    be able to infer the corner points
        const paddingOffset = 100;
        let paddingSize = 0;
        let top = 0,
            bottom = 0,
            left = 0,
            right = 0;
        if (height > width) {
            paddingSize = height - width;
            left = Math.trunc(paddingSize / 2);
            right = paddingSize % 2 == 0 ? left : left + 1; // one additional pixel of padding since paddingSize is odd
        } else if (height < width) {
            paddingSize = width - height;
            top = Math.trunc(paddingSize / 2);
            bottom = paddingSize % 2 == 0 ? top : top + 1; // one additional pixel of padding since paddingSize is odd
        }

        // I don't know if it is any better to use cv.BORDER_CONSTANT
        cv.copyMakeBorder(
            mat,
            mat,
            top + paddingOffset,
            bottom + paddingOffset,
            left + paddingOffset,
            right + paddingOffset,
            cv.BORDER_REPLICATE,
        );

        return mat;
    }

    /**
     * Returns Tensor with 3 channels with size inputSize x inputSize such that
     * one channel contains all the color data. All the channel values are
     * normalized.
     *
     * for example channel 1 = BBBBBB, channel 2 = GGGGGG, channel 3 = RRRRRR
     *
     * @param mat - Image to make into tensor
     * @param inputSize
     */
    private getAITensorInput(mat: cv.Mat, inputSize: number): ort.Tensor {
        const pixelArray = mat.data;
        const tensorData = new Float32Array(3 * inputSize * inputSize);

        let tensorIndex = 0;
        const channel2Offset = inputSize * inputSize;
        const channel3Offset = 2 * inputSize * inputSize;
        for (let i = 0; i < pixelArray.length; i += 3) {
            tensorData[tensorIndex] = pixelArray[i + 2] / 255.0;
            tensorData[channel2Offset + tensorIndex] = pixelArray[i + 1] / 255.0;
            tensorData[channel3Offset + tensorIndex] = pixelArray[i] / 255.0;
            tensorIndex++;
        }
        return new ort.Tensor('float32', tensorData, [1, 3, inputSize, inputSize]);
    }

    /**
     * Returns coordinate of center of polygon with the largest area inside image
     *
     * @param mat grayscale image as float32
     * @param threshold pixels with values lower than threshold will be treated as 0
     */
    private getCentroidOfMaxContour(mat: cv.Mat, threshold: number = 0.3): cv.Point {
        // binarization, for better contour finding
        mat.data32F.set(
            mat.data32F.map((val) => {
                if (val < threshold) return 0;
                return 255;
            }),
        );
        mat.convertTo(mat, cv.CV_8UC1);

        const contours = new cv.MatVector();
        cv.findContours(mat, contours, new cv.Mat(), cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        let maxArea = -Infinity;
        let maxMat = new cv.Mat();
        for (let i = 0; i < contours.size(); i++) {
            const contourArea = cv.contourArea(contours.get(i));
            if (contourArea > maxArea) {
                maxArea = contourArea;
                maxMat = contours.get(i);
            }
        }
        const docCorner = cv.moments(maxMat);
        const x = docCorner['m10'] / docCorner['m00'];
        const y = docCorner['m01'] / docCorner['m00'];
        return new cv.Point(x, y);
    }

    private cropAndFixPerspective(
        src: cv.Mat,
        dst: cv.Mat,
        corners: cv.Point[],
        resultWidth: number,
        resultHeight: number,
    ): void {
        const dSize = new cv.Size(resultWidth, resultHeight);
        const inputPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
            corners[0].x,
            corners[0].y,
            corners[1].x,
            corners[1].y,
            corners[3].x,
            corners[3].y,
            corners[2].x,
            corners[2].y,
        ]);
        const outputPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
            0,
            0,
            resultWidth,
            0,
            0,
            resultHeight,
            resultWidth,
            resultHeight,
        ]);
        const perspectiveTransform = cv.getPerspectiveTransform(inputPts, outputPts);
        cv.warpPerspective(src, dst, perspectiveTransform, dSize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
    }

    async extractDocumentFromPhotoWithAI(
        photo: Buffer,
        imageWidth: number,
        imageHeight: number,
    ): Promise<Buffer | null> {
        const metadata = await sharp(photo).metadata();
        const originalWidth = metadata.width!;
        const originalHeight = metadata.height!;

        //we need raw buffer for opencv to work
        photo = await sharp(photo).removeAlpha().png().raw().toBuffer();

        let mat = await this.padImageToMakeSquare(photo, originalWidth, originalHeight);
        const paddedWidth = mat.size().width;
        const paddedHeight = mat.size().height;
        const paddedMat = new cv.Mat(mat);

        const aiModelInputSize = 256;
        cv.resize(mat, mat, new cv.Size(aiModelInputSize, aiModelInputSize));

        const tensor = this.getAITensorInput(mat, aiModelInputSize);

        const aiModel = await this.getAIModel();
        const result = await aiModel.run({ img: tensor });
        if (result['heatmap'].dims[1] != 4) {
            // could not find 4 corners
            return null;
        }
        /*
            heatmap has the following shape where c1 means corner1 data
            c1c1c1c1...c2c2c2c2...c3c3c3c3...c4c4c4c4
        */
        const heatmap = (await result['heatmap'].getData()) as Float32Array;
        const documentCorners = [];
        const numberOfCorners = 4;
        const aiModelOutputSize = 128;

        for (let corner = 0; corner < numberOfCorners; corner++) {
            mat = cv.matFromArray(
                aiModelOutputSize,
                aiModelOutputSize,
                cv.CV_32FC1,
                heatmap.subarray(
                    corner * aiModelOutputSize * aiModelOutputSize,
                    (corner + 1) * aiModelOutputSize * aiModelOutputSize,
                ),
            );
            cv.resize(mat, mat, new cv.Size(paddedWidth, paddedHeight), 0, 0, cv.INTER_LINEAR);

            const cornerCoordinates = this.getCentroidOfMaxContour(mat);
            documentCorners.push(cornerCoordinates);
        }

        this.cropAndFixPerspective(paddedMat, mat, documentCorners, imageWidth, imageHeight);
        return await sharp(mat.data, {
            raw: {
                width: imageWidth,
                height: imageHeight,
                channels: 3,
            },
        })
            .png()
            .toBuffer();
    }

    /**
     * Detects and crops a document from a photo
     * @param photo photo containing a document
     * @param imageWidth required image width
     * @param imageHeight required image height
     * @returns PNG of the detected document
     */
    async extractDocumentFromPhoto(photo: Buffer, imageWidth: number, imageHeight: number): Promise<Buffer> {
        let extractedDocument = await this.extractDocumentFromPhotoWithAI(photo, imageWidth, imageHeight);
        if (!extractedDocument) {
            // for redundancy jscanify is used if AI fails
            extractedDocument = await this.extractDocumentFromPhotoWithImgProcessing(photo, imageWidth, imageHeight);
        }
        return extractedDocument;
    }

    async prepareDocumentForOcr(
        document: Buffer,
        mimeType: string,
        imageWidth: number,
        imageHeight: number,
    ): Promise<Buffer> {
        if (this.pdfMimeTypes.includes(mimeType)) {
            document = (await this.convertPdfToImg(document))[0];
            document = await sharp(document)
                .resize(imageWidth, imageHeight, {
                    fit: 'fill',
                })
                .png()
                .toBuffer();
        } else if (this.imageMimeTypes.includes(mimeType)) {
            document = await this.extractDocumentFromPhoto(document, imageWidth, imageHeight);
        } else {
            throw new Error(`MIME type ${mimeType} not supported`);
        }

        return document;
    }
}
