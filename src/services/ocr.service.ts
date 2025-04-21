import sharp from 'sharp';

import { TesseractService } from './tesseract.service.js';
import { ImageLike } from 'tesseract.js';
import { IField } from '../database/models/documentLayout.model.js';

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

    private async getTesseractResult(image: ImageLike): Promise<IOcrResult> {
        const result = await this.tesseractService.extract(image);
        return {
            text: result.text,
            confidence: result.confidence,
        };
    }

    /**
     * Extracts text from an image using multiple OCR services and returns the best result
     * @param image image to extract text from
     * @returns extracted text and confidence level
     */
    async extract(image: Buffer): Promise<IOcrResult> {
        return await this.getTesseractResult(image);
    }

    async extractFields(image: Buffer, fields: IField[]): Promise<IMappedOcrResult[]> {
        const result = [];

        for (const field of fields) {
            // sharp expects integers
            field.upper_left[0] = Math.round(field.upper_left[0]);
            field.upper_left[1] = Math.round(field.upper_left[1]);
            field.lower_right[0] = Math.round(field.lower_right[0]);
            field.lower_right[1] = Math.round(field.lower_right[1]);

            const croppedPart = await sharp(image)
                .extract({
                    left: field.upper_left[0],
                    top: field.upper_left[1],
                    width: field.lower_right[0] - field.upper_left[0],
                    height: field.lower_right[1] - field.upper_left[1],
                })
                .png()
                .toBuffer();
            const ocrResult = await this.extract(croppedPart);
            result.push({ field: field, ocrResult: ocrResult });
        }

        return result;
    }
}
