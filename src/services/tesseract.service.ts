import { createWorker, Worker } from 'tesseract.js';

import { IOcrEngine, IOcrResult } from '../types/ocr.js';

export class TesseractService implements IOcrEngine {
    private worker: Worker | null = null;

    async startup(langCode: string): Promise<void> {
        await this.cleanup();
        this.worker = await createWorker(langCode);
    }

    async cleanup(): Promise<void> {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
        }
    }

    async extractSingleField(image: Buffer): Promise<IOcrResult> {
        const ocrResult: IOcrResult = {
            text: '',
            confidence: 0,
            price: 0,
        };
        if (this.worker) {
            const result = await this.worker.recognize(image);
            ocrResult.text = result.data.text;
            ocrResult.confidence = result.data.confidence;
        }
        return ocrResult;
    }
}
