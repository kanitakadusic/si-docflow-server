import jscanify from 'jscanify';
import sharp from 'sharp';
import { loadImage } from 'canvas';

export class DocumentPreprocessorService {
    /*
     * Returns all pdf pages as an array of image buffers
     */
    async pdfToPng(pdfAsBuffer: Buffer): Promise<Buffer[]> {
        const { pdf } = await import('pdf-to-img');
        const document = await pdf(pdfAsBuffer, { scale: 3 });

        const images: Buffer[] = [];
        for await (const image of document) {
            images.push(image);
        }
        return images;
    }

    private openCVloaded = false;
    private async initOpenCV() {
        return new Promise<void>((resolve) => {
            const scanner = new jscanify();
            scanner.loadOpenCV(() => {
                console.log('OpenCV loaded');
                this.openCVloaded = true;
                resolve();
            });
        });
    }
    async extractDocumentFromImage(image: Buffer, image_width: number, image_height: number): Promise<Buffer> {
        if(!this.openCVloaded) await this.initOpenCV();
        const scanner = new jscanify();
        const imageForExtraction = await loadImage(image);
        return scanner.extractPaper(imageForExtraction, image_width, image_height).toBuffer('image/png');
    }

    async prepareDocumentForOcr(
        document: Buffer,
        mimeType: string,
        image_width: number,
        image_height: number,
    ): Promise<Buffer> {
        let preparedDocumentPng: Buffer;
        if (mimeType == 'application/pdf') {
            preparedDocumentPng = (await this.pdfToPng(document))[0]; //only first page of pdf
        }
        else {
            image_height-=50; // offset because jscanify doesnt extract well and some background still remains
            preparedDocumentPng = await this.extractDocumentFromImage(document, image_width, image_height);
        }

        // image preprocessing for better OCR results
        // if a lot of problems arise you can play with parameters or remove filters
        // resize NEEDS to stay
        preparedDocumentPng = await sharp(preparedDocumentPng)
            .grayscale()
            .normalise()
            .resize(image_width, image_height)
            .threshold()
            .png()
            .toBuffer();

        return preparedDocumentPng;
    }
}