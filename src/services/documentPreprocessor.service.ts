import jscanify from 'jscanify';
import sharp from 'sharp';
import { loadImage } from 'canvas';
import { pdf as pdfToImg } from 'pdf-to-img';

export class DocumentPreprocessorService {
    private readonly pdfMimeTypes: string[] = ['application/pdf'];
    private readonly imageMimeTypes: string[] = ['image/jpeg', 'image/png'];

    private static readonly scanner = new jscanify();
    private static openCVLoaded = false;

    static async initOpenCV(): Promise<void> {
        if (!DocumentPreprocessorService.openCVLoaded) {
            await new Promise<void>((resolve) => {
                DocumentPreprocessorService.scanner.loadOpenCV(() => {
                    DocumentPreprocessorService.openCVLoaded = true;
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
        const imageForExtraction = await loadImage(photo);
        return DocumentPreprocessorService.scanner
            .extractPaper(imageForExtraction, imageWidth, imageHeight)
            .toBuffer('image/png');
    }

    async prepareDocumentForOcr(
        document: Buffer,
        mimeType: string,
        imageWidth: number,
        imageHeight: number,
    ): Promise<Buffer> {
        let preparedDocument: Buffer;

        if (this.pdfMimeTypes.includes(mimeType)) {
            preparedDocument = (await this.convertPdfToImg(document))[0];
        } else if (this.imageMimeTypes.includes(mimeType)) {
            imageHeight -= 50; // offset because jscanify doesn't extract well and some background still remains
            preparedDocument = await this.extractDocumentFromPhoto(document, imageWidth, imageHeight);
        } else {
            throw new Error(`MIME type ${mimeType} not supported`);
        }

        // image preprocessing for better OCR results
        // sharp expects integers
        preparedDocument = await sharp(preparedDocument)
            .grayscale()
            .normalise()
            .resize(Math.round(imageWidth), Math.round(imageHeight))
            .threshold()
            .png()
            .toBuffer();

        return preparedDocument;
    }
}
