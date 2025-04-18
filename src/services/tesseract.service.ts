import tesseract, { ImageLike, Page } from 'tesseract.js';

export class TesseractService {
    // This way a worker is created only once for the whole runtime
    private worker: tesseract.Worker | null = null;

    private async initTesseractWorker() {
        if(this.worker == null) {
            this.worker = await tesseract.createWorker(['bos', 'srp']);
        }
    }
    async extract(image: ImageLike): Promise<Page> {
        await this.initTesseractWorker();
        const result = await this.worker!.recognize(image);
        return result.data;
    }
}
