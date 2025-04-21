import { createWorker, ImageLike, Page, Worker } from 'tesseract.js';

export class TesseractService {
    private static readonly supportedLangCodes: string[] = ['bos', 'srp'];

    private worker: Worker | null = null;

    async createWorker(langCode: string): Promise<void> {
        if (!TesseractService.supportedLangCodes.includes(langCode)) {
            throw new Error(`Language code ${langCode} not supported`);
        }
        await this.terminateWorker();
        this.worker = await createWorker(langCode);
    }

    async terminateWorker(): Promise<void> {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
        }
    }

    async extract(image: ImageLike): Promise<Page> {
        if (!this.worker) {
            throw new Error('Worker not created');
        }
        const result = await this.worker.recognize(image);
        return result.data;
    }
}
