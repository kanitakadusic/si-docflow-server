import jscanify from 'jscanify';
import sharp from 'sharp';
import { loadImage } from 'canvas';
import { pdf as pdfToImg } from 'pdf-to-img';

export class DocumentPreprocessorService {
    private readonly pdfMimeTypes: string[] = ['application/pdf'];
    private readonly imageMimeTypes: string[] = ['image/jpeg', 'image/png'];

    private readonly scanner = new jscanify();
    private openCVLoaded: boolean = false;

    private async loadOpenCV(): Promise<void> {
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

    /**
     * Detects and crops a document from a photo
     * @param photo photo containing a document
     * @param imageWidth required image width
     * @param imageHeight required image height
     * @returns PNG of the detected document
     */
    async extractDocumentFromPhoto(photo: Buffer, imageWidth: number, imageHeight: number): Promise<Buffer> {
        await this.loadOpenCV();
        const imageForExtraction = await loadImage(photo);
        return this.scanner.extractPaper(imageForExtraction, imageWidth, imageHeight).toBuffer('image/png');
    }

    async prepareDocumentForOcr(
        document: Buffer,
        mimeType: string,
        imageWidth: number,
        imageHeight: number,
    ): Promise<Buffer> {
        if (this.pdfMimeTypes.includes(mimeType)) {
            document = (await this.convertPdfToImg(document))[0];
        } else if (this.imageMimeTypes.includes(mimeType)) {
            document = await this.extractDocumentFromPhoto(document, imageWidth, imageHeight);
        } else {
            throw new Error(`MIME type ${mimeType} not supported`);
        }

        // image preprocessing for better OCR results
        // sharp expects integers
        document = await sharp(document)
            .resize(Math.round(imageWidth), Math.round(imageHeight), {
                fit: 'fill',
            })
            .png()
            .toBuffer();

        return document;
    }
}
