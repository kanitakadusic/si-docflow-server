import { TesseractService } from './tesseract.service';
import { ImageLike } from 'tesseract.js';
import { IField } from '../database/models/documentLayout.model';
import { DocumentPreprocessorService } from './documentPreprocessor.service';
import { DocumentLayoutService } from './documentLayout.service';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
export interface IOcrResult {
    text: string;
    confidence: number;
}

export interface IMappedOcrResult {
    field: IField;
    ocrResult: IOcrResult;
}

export class OcrService {
    private readonly documentLayoutService = new DocumentLayoutService();
    private readonly documentPreprocessorService = new DocumentPreprocessorService();
    private readonly tesseractService = new TesseractService();

    private async getTesseractResult(image: ImageLike): Promise<IOcrResult> {
        const result = await this.tesseractService.extract(image);
        return {
            text: result.text,
            confidence: result.confidence,
        };
    }

    // the best result (from multiple OCR services)
    async extract(image: Buffer): Promise<IOcrResult> {
        return await this.getTesseractResult(image);
    }

    // from documentType derive fields and image size through document services
    
    // error ignore for documentType
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async extractFields(image: Buffer, mimeType: string, documentType: string): Promise<IMappedOcrResult[]> {

        // get fields, image size from services here using documentType...

        // Hardcoded values because database is on vacation
        const documentLayouts = await this.documentLayoutService.getAllTest();
        const fields = documentLayouts[0].fields as unknown as IField[]; // ugly cast because hard coded values
        const hardCoded_image_width = 1785;
        const hardCoded_image_height = 2526;

        const preprocessedImage = await this.documentPreprocessorService
            .prepareDocumentForOcr(image, mimeType, hardCoded_image_width, hardCoded_image_height);
        
        await fs.writeFileSync(path.join(__dirname, "..", "..", "ocr_outputs", "output.png"), preprocessedImage); //for debug

        const result = [];
        let i=1;
        for (const field of fields) {
            const croppedPart = await sharp(preprocessedImage)
                                      .extract({
                                        left: field.upper_left[0],
                                        top: field.upper_left[1],
                                        width: field.lower_right[0]-field.upper_left[0],
                                        height: field.lower_right[1]-field.upper_left[1]
                                      })
                                      .png().toBuffer();
            fs.writeFileSync(path.join(__dirname, "..", "..", "ocr_outputs", `part${i++}.png`), croppedPart); // for debug
            const ocrResult = await this.extract(croppedPart);
            result.push({ field: field, ocrResult: ocrResult });
        }
        return result;
        /*
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
        */
    }
}
