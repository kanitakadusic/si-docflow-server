import sharp from 'sharp';
// debug ->
// import path, { join } from 'path';
// import fs from 'fs';
//
// import { ROOT } from '../config/env.js';
// <- debug
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

    // debug ->
    // private sanitizeFieldName(str: string): string {
    //     return str
    //         .normalize('NFD')
    //         .replace(/[\u0300-\u036f]/g, '')
    //         .replace(/[^a-zA-Z0-9]/g, '_')
    //         .replace(/_+/g, '_')
    //         .replace(/^_|_$/g, '')
    //         .toLowerCase();
    // }
    // <- debug

    private async cropFields(image: Buffer, fields: IField[]): Promise<{ field: IField; image: Buffer }[]> {
        // debug ->
        // const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        // const outputDir = path.join(ROOT, 'debug', 'ocr_outputs', timestamp);
        // fs.mkdirSync(outputDir, { recursive: true });
        // fs.writeFileSync(join(outputDir, 'DOCUMENT.jpeg'), image);
        // <- debug

        return Promise.all(
            fields.map(async (field) => {
                const cropped = await sharp(image)
                    .extract({
                        left: Math.round(field.upper_left[0]),
                        top: Math.round(field.upper_left[1]),
                        width: Math.round(field.lower_right[0] - field.upper_left[0]),
                        height: Math.round(field.lower_right[1] - field.upper_left[1]),
                    })
                    .jpeg()
                    .toBuffer();

                // debug ->
                // const outputPath = path.join(outputDir, `${this.sanitizeFieldName(field.name)}.jpeg`);
                // fs.writeFileSync(outputPath, cropped);
                // <- debug

                return { field, image: cropped };
            }),
        );
    }

    async extractFields(image: Buffer, fields: IField[], engine: IOcrEngine): Promise<IMappedOcrResultWithImage[]> {
        const crops = await this.cropFields(image, fields);

        if (typeof engine.extractFieldsBatch === 'function') {
            const results = await engine.extractFieldsBatch(crops);
            return results.map((r) => ({
                mappedResult: r,
                image: Buffer.alloc(0),
            }));
        }

        if (typeof engine.extractSingleField === 'function') {
            const results: IMappedOcrResultWithImage[] = [];
            for (const { field, image: cropped } of crops) {
                const ocrResult = await engine.extractSingleField(cropped);
                if (!field.is_multiline) {
                    ocrResult.text = ocrResult.text.replace(/\n/g, '');
                }
                results.push({ mappedResult: { field, result: ocrResult }, image: cropped });
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
    ): Promise<IMappedOcrResultWithImage[]> {
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
