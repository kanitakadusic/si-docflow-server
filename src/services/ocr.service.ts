import sharp from 'sharp';
import { IField } from '../types/model.js';
import { IMappedOcrResultWithImage, IOcrEngine } from '../types/ocr.js';
import { TesseractService } from './tesseract.service.js';
import { GoogleVisionService } from './googleVision.service.js';
import { ChatGptService } from './chatGpt.service.js';

export class OcrService {
    private readonly engines: Map<string, IOcrEngine> = new Map<string, IOcrEngine>([
        ['tesseract', new TesseractService()],
        ['googleVision', new GoogleVisionService()],
        ['chatGpt', new ChatGptService()],
    ]);

    private async cropFields(image: Buffer, fields: IField[]): Promise<{ field: IField, image: Buffer }[]> {
        return Promise.all(fields.map(async field => {
            const cropped = await sharp(image)
                .extract({
                    left: Math.round(field.upper_left[0]),
                    top: Math.round(field.upper_left[1]),
                    width: Math.round(field.lower_right[0] - field.upper_left[0]),
                    height: Math.round(field.lower_right[1] - field.upper_left[1]),
                })
                .png()
                .toBuffer();
            return { field, image: cropped };
        }));
    }

    async extractFields(image: Buffer, fields: IField[], engine: IOcrEngine): Promise<IMappedOcrResultWithImage[]> {
        const crops = await this.cropFields(image, fields);

        // Ako engine podržava batch i ima tu metodu
        if (typeof engine.extractFieldsBatch === 'function') {
            const results = await engine.extractFieldsBatch(crops);
            return results.map(r => ({
                mappedResult: r,
                image: Buffer.alloc(0) // ili crop ako želiš prikaz
            }));
        }

        // Ako ne podržava batch, koristi pojedinačni `extract`
        const results: IMappedOcrResultWithImage[] = [];

        for (const { field, image: cropped } of crops) {
            const ocrResult = await engine.extract(cropped);
            if (!field.is_multiline) {
                ocrResult.text = ocrResult.text.replace(/\n/g, '');
            }
            results.push({ mappedResult: { field, result: ocrResult }, image: cropped });
        }

        return results;
    }

    async runOcr(image: Buffer, fields: IField[], engineName: string, langCode: string): Promise<IMappedOcrResultWithImage[]> {
        const engine = this.engines.get(engineName);

        if (!engine) {
            throw new Error(`Unsupported OCR engine: ${engineName}`);
        }

        await engine.startup(langCode);

        const result = await this.extractFields(image, fields, engine);

        await engine.cleanup();
        return result;
    }
}
