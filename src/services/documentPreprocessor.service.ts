// import jscanify from 'jscanify';
import * as ort from 'onnxruntime-node';
import sharp from 'sharp';
import cv from '@techstark/opencv-js';
// import { loadImage } from 'canvas';
import { pdf as pdfToImg } from 'pdf-to-img';
import { join } from 'path';
// debug ->
// import fs from 'fs';
// <- debug
import { AI_MODEL_NAME, ROOT } from '../config/env.js';

export class DocumentPreprocessorService {
    private readonly pdfMimeTypes: string[] = ['application/pdf'];
    private readonly imageMimeTypes: string[] = ['image/jpeg', 'image/png'];

    // private readonly scanner = new jscanify();
    // private openCVLoaded: boolean = false;
    private aiModel: ort.InferenceSession | null = null;

    // public async loadOpenCV(): Promise<void> {
    //     if (!this.openCVLoaded) {
    //         await new Promise<void>((resolve) => {
    //             this.scanner.loadOpenCV(() => {
    //                 this.openCVLoaded = true;
    //                 resolve();
    //             });
    //         });
    //     }
    // }

    /**
     * Converts PDF pages to an array of images
     * @param pdf PDF of a document
     * @returns images of PDF pages
     */
    async convertPdfToImg(pdf: Buffer): Promise<Buffer[]> {
        console.log(`convertPdfToImg: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`);

        const document = await pdfToImg(pdf, { scale: 3 });
        const images: Buffer[] = [];
        for await (const image of document) {
            images.push(image);
        }
        return images;
    }

    // async extractDocumentFromPhotoWithImgProcessing(
    //     photo: Buffer,
    //     imageWidth: number,
    //     imageHeight: number,
    // ): Promise<Buffer> {
    //     await this.loadOpenCV();
    //     const imageForExtraction = await loadImage(photo);
    //     return this.scanner.extractPaper(imageForExtraction, imageWidth, imageHeight).toBuffer('image/png');
    // }

    async getAiModel(): Promise<ort.InferenceSession> {
        console.log(`getAiModel: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`);

        if (!this.aiModel) {
            this.aiModel = await ort.InferenceSession.create(join(ROOT, 'ai_model', AI_MODEL_NAME));
        }
        return this.aiModel;
    }

    // debug ->
    // private async saveImage(
    //     mat: cv.Mat,
    //     fileName: string,
    //     width: number,
    //     height: number,
    //     channels: number,
    // ): Promise<void> {
    //     let buff = Buffer.alloc(0);
    //     if (channels == 3) {
    //         buff = await sharp(mat.data, {
    //             raw: {
    //                 width: width,
    //                 height: height,
    //                 channels: 3,
    //             },
    //         })
    //             .png()
    //             .toBuffer();
    //     } else if (channels == 1) {
    //         buff = await sharp(mat.data, {
    //             raw: {
    //                 width: width,
    //                 height: height,
    //                 channels: 1,
    //             },
    //         })
    //             .grayscale()
    //             .png()
    //             .toBuffer();
    //     }
    //
    //     fs.writeFileSync(join(ROOT, 'debug', 'ocr_outputs', fileName), buff);
    // }
    // <- debug

    private async padImageToMakeSquare(photo: Buffer, width: number, height: number): Promise<cv.Mat> {
        console.log(`padImageToMakeSquare: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`);

        const mat: cv.Mat = cv.matFromArray(height, width, cv.CV_8UC3, photo);

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

        // I do not know if it is any better to use cv.BORDER_CONSTANT
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
     * Returns Tensor with 3 channels with size inputSize x inputSize
     * such that one channel contains all the color data.
     * All the channel values are normalized.
     *
     * For example: channel 1 = BBBBBB, channel 2 = GGGGGG, channel 3 = RRRRRR
     *
     * @param mat - Image to make into tensor
     * @param inputSize
     */
    private getAiTensorInput(mat: cv.Mat, inputSize: number): ort.Tensor {
        console.log(`getAiTensorInput: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`);

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
     * @param mat grayscale image as float32
     * @param threshold pixels with values lower than threshold will be treated as 0
     */
    private getCentroidOfMaxContour(mat: cv.Mat, threshold: number = 0.3): cv.Point {
        console.log(`getCentroidOfMaxContour: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`);

        // binarization for better contour finding
        mat.data32F.set(
            mat.data32F.map((val) => {
                if (val < threshold) return 0;
                return 255;
            }),
        );

        const tempMat: cv.Mat = new cv.Mat();
        mat.convertTo(tempMat, cv.CV_8UC1);

        const contours: cv.MatVector = new cv.MatVector();
        const emptyMat: cv.Mat = new cv.Mat(); // function does not work without it
        cv.findContours(tempMat, contours, emptyMat, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

        tempMat.delete();
        emptyMat.delete();

        let maxArea: number = -Infinity;
        let maxMat: cv.Mat | null = null;

        for (let i = 0; i < contours.size(); i++) {
            const contour: cv.Mat = contours.get(i);
            const contourArea: number = cv.contourArea(contour);

            if (contourArea > maxArea) {
                if (maxMat !== null) {
                    maxMat.delete();
                }
                maxArea = contourArea;
                maxMat = contour;
            } else {
                contour.delete();
            }
        }

        contours.delete();

        const docCorner: cv.Moments = cv.moments(maxMat!);
        maxMat!.delete();

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
        console.log(`cropAndFixPerspective: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`);

        const inputPts: cv.Mat = cv.matFromArray(4, 1, cv.CV_32FC2, [
            corners[0].x,
            corners[0].y,
            corners[1].x,
            corners[1].y,
            corners[3].x,
            corners[3].y,
            corners[2].x,
            corners[2].y,
        ]);
        const outputPts: cv.Mat = cv.matFromArray(4, 1, cv.CV_32FC2, [
            0,
            0,
            resultWidth,
            0,
            0,
            resultHeight,
            resultWidth,
            resultHeight,
        ]);

        const perspectiveTransform: cv.Mat = cv.getPerspectiveTransform(inputPts, outputPts);
        inputPts.delete();
        outputPts.delete();

        const dSize: cv.Size = new cv.Size(resultWidth, resultHeight);
        cv.warpPerspective(src, dst, perspectiveTransform, dSize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());

        perspectiveTransform.delete();
    }

    async extractDocumentFromPhotoWithAi(
        photo: Buffer,
        imageWidth: number,
        imageHeight: number,
    ): Promise<Buffer | null> {
        console.log(`extractDocumentFromPhotoWithAi: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`);

        const aiModelInputSize = 256;
        const aiModelOutputSize = 128;

        const { width: originalWidth, height: originalHeight } = await sharp(photo).metadata();
        if (!originalWidth || !originalHeight) {
            return null;
        }
        photo = await sharp(photo).removeAlpha().jpeg().raw().toBuffer();

        let mat: cv.Mat = await this.padImageToMakeSquare(photo, originalWidth, originalHeight);
        const { width: paddedWidth, height: paddedHeight } = mat.size();
        const paddedMat: cv.Mat = mat.clone();

        cv.resize(mat, mat, new cv.Size(aiModelInputSize, aiModelInputSize));

        const aiModel: ort.InferenceSession = await this.getAiModel();
        const result: ort.InferenceSession.OnnxValueMapType = await aiModel.run({
            img: this.getAiTensorInput(mat, aiModelInputSize),
        });
        if (result['heatmap'].dims[1] != 4) {
            // could not find 4 corners
            return null;
        }

        mat.delete();

        // heatmap has the following shape where c1 means corner1 data
        // c1c1c1c1...c2c2c2c2...c3c3c3c3...c4c4c4c4
        const heatmap = (await result['heatmap'].getData()) as Float32Array;
        const documentCorners: cv.Point[] = [];

        for (let corner = 0; corner < 4; corner++) {
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
            documentCorners.push(this.getCentroidOfMaxContour(mat));
            mat.delete();
        }

        this.cropAndFixPerspective(paddedMat, paddedMat, documentCorners, imageWidth, imageHeight);
        const extractedDoc = await sharp(paddedMat.data, {
            raw: {
                width: imageWidth,
                height: imageHeight,
                channels: 3,
            },
        })
            .jpeg()
            .toBuffer();

        paddedMat.delete();

        return extractedDoc;
    }

    async prepareDocumentForOcr(
        document: Buffer,
        mimeType: string,
        imageWidth: number,
        imageHeight: number,
    ): Promise<Buffer> {
        console.log(`prepareDocumentForOcr: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`);

        if (this.pdfMimeTypes.includes(mimeType)) {
            document = (await this.convertPdfToImg(document))[0];
            document = await sharp(document)
                .resize(imageWidth, imageHeight, {
                    fit: 'fill',
                })
                .jpeg()
                .toBuffer();
        } else if (this.imageMimeTypes.includes(mimeType)) {
            const extractedDocument = await this.extractDocumentFromPhotoWithAi(document, imageWidth, imageHeight);
            if (extractedDocument !== null) {
                document = extractedDocument;
            } else {
                throw new Error(`Document extraction with AI failed`);
            }
            // document =
            //     (await this.extractDocumentFromPhotoWithAi(document, imageWidth, imageHeight)) ??
            //     (await this.extractDocumentFromPhotoWithImgProcessing(document, imageWidth, imageHeight));
        } else {
            throw new Error(`MIME type ${mimeType} not supported`);
        }

        return document;
    }
}
