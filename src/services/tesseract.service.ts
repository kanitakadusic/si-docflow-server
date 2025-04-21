import { createWorker, ImageLike, Page, Worker } from 'tesseract.js';

export class TesseractService {
    private static worker: Worker | null = null;

    static async createWorker(): Promise<void> {
        if (!TesseractService.worker) {
            TesseractService.worker = await createWorker(['bos', 'srp']);
        }
    }

    static async terminateWorker(): Promise<void> {
        if (TesseractService.worker) {
            await TesseractService.worker.terminate();
            TesseractService.worker = null;
        }
    }

    async extract(image: ImageLike): Promise<Page> {
        if (!TesseractService.worker) {
            throw new Error('Tesseract worker not initialized');
        }
        const result = await TesseractService.worker.recognize(image);
        return result.data;
    }
}
