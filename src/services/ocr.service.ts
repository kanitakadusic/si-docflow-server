import sharp from 'sharp';

import { TesseractService } from './tesseract.service.js';
import { ImageLike } from 'tesseract.js';
import { IField } from '../database/models/documentLayout.model.js';
import { GoogleVisionService } from './googleVision.service.js';
import { ChatGptOcrService } from './chatgpt.service.js';


export interface IOcrResult {
    text: string;
    confidence: number;
}

export interface IMappedOcrResult {
    field: IField;
    ocrResult: IOcrResult;
}

export class OcrService {
    private readonly tesseractService = new TesseractService();
    private readonly googleService = new GoogleVisionService();
    private readonly chatgptService = new ChatGptOcrService();

    /**
     * Extracts text from an image using multiple OCR services and returns the best result
     * @param image image to extract text from
     * @returns extracted text and confidence level
     */

    private async extractFieldsWithEngine(
        service: { extract(image: Buffer): Promise<IOcrResult> },
        image: Buffer,
        fields: IField[]
    ): Promise<IMappedOcrResult[]> {
        const result: IMappedOcrResult[] = [];
    
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
    
            const ocrResult = await service.extract(cropped);
            result.push({ field, ocrResult });
        }
    
        return result;
    }

    async runEngine(
        engine: string,
        image: Buffer,
        fields: IField[],
        langCode: string
    ): Promise<{ service: string; data: IMappedOcrResult[] }> {
        
            switch (engine) {
                case 'tesseract':
                    await this.tesseractService.createWorker(langCode);
                    const tessData = await this.extractFieldsWithEngine(this.tesseractService, image, fields);
                    await this.tesseractService.terminateWorker();
                    return { service: 'tesseract', data: tessData };
        
                case 'google':
                    const googleData = await this.extractFieldsWithEngine(this.googleService, image, fields);
                    return { service: 'google', data: googleData };

                case 'chatgpt':
                    const gptData = await this.extractFieldsWithEngine(this.chatgptService, image, fields);
                    return { service: 'chatgpt', data: gptData };
                    
                default:
                    throw new Error(`Unsupported OCR engine: ${engine}`);
            }
    }
    async extractFieldsMultiEngine(
        engines: string[],
        image: Buffer,
        fields: IField[],
        langCode: string
    ): Promise<{ service: string; data: IMappedOcrResult[] }[]> {
        const allResults = [];
        for (const engine of engines) {
            const result = await this.runEngine(engine, image, fields, langCode);
            allResults.push(result);
        }
        return allResults;
    }
    }
