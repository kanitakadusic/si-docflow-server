import sharp from 'sharp';
// debug ->
import path, { join } from 'path';
import fs from 'fs';

import { ROOT } from '../config.js';
// <- debug
import { IField } from '../database/models/documentLayout.model.js';
import { IMappedOcrResult, IOcrEngine } from '../types/ocr.js';
import { TesseractService } from './tesseract.service.js';
import { GoogleVisionService } from './googleVision.service.js';
import { ChatGptService } from './chatGpt.service.js';

export class OcrService {
    private readonly engines: Map<string, IOcrEngine> = new Map([
        ['tesseract', new TesseractService()],
        ['googleVision', new GoogleVisionService()],
        ['chatGpt', new ChatGptService()],
    ]);

    async extractFields(image: Buffer, fields: IField[], engine: IOcrEngine): Promise<IMappedOcrResult[]> {
        const result: IMappedOcrResult[] = [];

        // debug ->
        const sanitizeFieldName = function (str: string): string {
            return str
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-zA-Z0-9]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '')
                .toLowerCase();
        };

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputDir = path.join(ROOT, 'debug', 'ocr_outputs', timestamp);
        fs.mkdirSync(outputDir, { recursive: true });

        fs.writeFileSync(join(outputDir, 'DOCUMENT.png'), image);
        // <- debug

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

            // debug ->
            const outputPath = path.join(outputDir, `${sanitizeFieldName(field.name)}.png`);
            fs.writeFileSync(outputPath, cropped);
            // <- debug

            const ocrResult = await engine.extract(cropped);
            if (!field.is_multiline) {
                ocrResult.text = ocrResult.text.replace(/\n/g, '');
            }

            result.push({ field, ocrResult });
        }

        return result;
    }

    async runOcr(image: Buffer, fields: IField[], engineName: string, langCode: string): Promise<IMappedOcrResult[]> {
        const engine: IOcrEngine | undefined = this.engines.get(engineName);
        if (!engine) {
            throw new Error(`Unsupported OCR engine: ${engineName}`);
        }

        await engine.startup(langCode);
        const result = await this.extractFields(image, fields, engine);
        await engine.cleanup();

        return result;
    }
}
