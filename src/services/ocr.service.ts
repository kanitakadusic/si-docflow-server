import sharp from 'sharp';
// debug ->
// import path, { join } from 'path';
// import fs from 'fs';
//
// import { ROOT } from '../config.js';
// <- debug
import { IField } from '../types/model.js';
import { IMappedOcrResultWithImage, IOcrEngine } from '../types/ocr.js';
import { TesseractService } from './tesseract.service.js';
import { GoogleVisionService } from './googleVision.service.js';
import { ChatGptService } from './chatGpt.service.js';

export class OcrService {
    private readonly engines: Map<string, IOcrEngine> = new Map<string, IOcrEngine>([
        ['tesseract', new TesseractService() as IOcrEngine],
        ['googleVision', new GoogleVisionService() as IOcrEngine],
        ['chatGpt', new ChatGptService() as IOcrEngine],
    ]);

    async extractFields(image: Buffer, fields: IField[], engine: IOcrEngine): Promise<IMappedOcrResultWithImage[]> {
        const result: IMappedOcrResultWithImage[] = [];

        for (const field of fields) {
            const cropped = await sharp(image)
                .extract({
                    left: Math.round(field.upper_left[0]),
                    top: Math.round(field.upper_left[1]),
                    width: Math.round(field.lower_right[0] - field.upper_left[0]),
                    height: Math.round(field.lower_right[1] - field.upper_left[1]),
                })
                .png()
                .toBuffer();

            const ocrResult = await engine.extract(cropped);
            if (!field.is_multiline) {
                ocrResult.text = ocrResult.text.replace(/\n/g, '');
            }

            result.push({ mappedResult: { field, result: ocrResult }, image: cropped });
        }

        return result;
    }

    async runOcr(image: Buffer, fields: IField[], engineName: string, langCode: string): Promise<IMappedOcrResultWithImage[]> {
        const engine = this.engines.get(engineName);

        if (!engine) {
            throw new Error(`Unsupported OCR engine: ${engineName}`);
        }

        await engine.startup(langCode);

        let result: IMappedOcrResultWithImage[];

        // Ako engine implementira extractFieldsBatch (provjera pomoću type guarda)
        if (typeof engine.extractFieldsBatch === 'function') {
            const batchResult = await engine.extractFieldsBatch(image, fields);
            result = batchResult.map(r => ({
                mappedResult: r,
                image: Buffer.alloc(0), // prazna slika jer smo sve spojili
            }));
        } else {
            result = await this.extractFields(image, fields, engine);
        }

        await engine.cleanup();
        return result;
    }
}
