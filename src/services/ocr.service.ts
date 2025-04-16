import { TesseractService } from './tesseract.service';
import { ImageLike } from 'tesseract.js';
import { IField } from '../database/models/documentLayout.model';

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

    // the best result (from multiple OCR services)
    async extract(image: any): Promise<IOcrResult> {
        return await this.getTesseractResult(image);
    }

    async extractFields(image: any, fields: IField[]): Promise<IMappedOcrResult[]> {
        const result = await this.extract(image);
        return [
            {
                field: {
                    name: 'field-1',
                    upper_left: [1.1, 1.1],
                    lower_right: [5.5, 5.5],
                },
                ocrResult: {
                    text: result.text,
                    confidence: result.confidence,
                },
            },
        ];
    }
}
