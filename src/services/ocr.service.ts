import { IField } from '../types/model.js';
import { IFieldWithCrop, IMappedOcrResultWithCrop, IOcrEngine, IOcrResult } from '../types/ocr.js';
import { TesseractService } from './engines/tesseract.service.js';
import { GoogleVisionService } from './engines/googleVision.service.js';
import { ChatGptService } from './engines/chatGpt.service.js';
import { cropFields } from '../utils/image.util.js';

export class OcrService {
    async extractFields(image: Buffer, fields: IField[], engine: IOcrEngine): Promise<IMappedOcrResultWithCrop[]> {
        const fieldsWithCrop: IFieldWithCrop[] = await cropFields(image, fields);

        if (typeof engine.extractFieldsBatch === 'function') {
            return await engine.extractFieldsBatch(fieldsWithCrop);
        }

        if (typeof engine.extractSingleField === 'function') {
            const results: IMappedOcrResultWithCrop[] = [];
            for (const fieldWithCrop of fieldsWithCrop) {
                const result: IOcrResult = await engine.extractSingleField(fieldWithCrop.crop);
                if (!fieldWithCrop.is_multiline) {
                    result.text = result.text.replace(/\n/g, '');
                }
                results.push({ fieldWithCrop, result });
            }
            return results;
        }

        throw new Error('Fields extraction unsupported');
    }

    async runOcr(
        image: Buffer,
        fields: IField[],
        engineName: string,
        langCode: string,
    ): Promise<IMappedOcrResultWithCrop[]> {
        let engine: IOcrEngine;

        if (engineName === 'tesseract') {
            engine = new TesseractService();
        } else if (engineName === 'googleVision') {
            engine = new GoogleVisionService();
        } else if (engineName === 'chatGpt') {
            engine = new ChatGptService();
        } else {
            throw new Error(`Unsupported OCR engine: ${engineName}`);
        }

        await engine.startup(langCode);
        const result = await this.extractFields(image, fields, engine);
        await engine.cleanup();

        return result;
    }
}
