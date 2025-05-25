import { assert, expect, test, describe, beforeAll, it } from 'vitest';
import { DocumentLayout, LayoutImage } from "../../src/config/db.js";
import { OcrService } from "../../src/services/ocr.service.js";
import { DocumentPreprocessorService } from "../../src/services/documentPreprocessor.service.js"
import { IField } from "../../src/types/model.d.js";

import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const chatGptMaximumCost = 0.006;
const googleVisionMaximumCost = 0.002;
const zzspmLayoutId = 1;
const documentName = "ss_printed_latin.png";

describe('Ocr cost minimization', () => {
    let ocrService: OcrService;
    let documentPreprocessorService: DocumentPreprocessorService;
    let documentLayout: DocumentLayout;
    let layoutImage: LayoutImage;
    let document: Buffer;

    let processedDocument: Buffer;

    beforeAll(async () => {
        ocrService = new OcrService();
        documentPreprocessorService = new DocumentPreprocessorService();
        documentLayout = (await DocumentLayout.findByPk(zzspmLayoutId))!;
        console.log(documentLayout);
        layoutImage = (await LayoutImage.findByPk(documentLayout.image_id))!;
        console.log(layoutImage);
        document = fs.readFileSync(path.join(__dirname, "..", "resources", documentName));
        processedDocument = await documentPreprocessorService.prepareDocumentForOcr(document, 'image/png', layoutImage.width, layoutImage.height);
        console.log(processedDocument);
    });

    it('should return cost lower than chat gpt maximum cost', async() => {
        const result = await ocrService.runOcr(processedDocument, documentLayout.getFields(), "chatGpt", "bos");
        let totalPrice = 0;
        result.forEach( res => { totalPrice += res.mappedResult.result.price; });
        expect(totalPrice).toBeLessThan(chatGptMaximumCost);
    });

    it('should return cost lower than google vision maximum cost', async() => {
        const result = await ocrService.runOcr(processedDocument, documentLayout.getFields(), "googleVision", "bos");
        console.log(result);
        let totalPrice = 0;
        result.forEach( res => { totalPrice += res.mappedResult.result.price; });
        expect(totalPrice).toBeLessThan(googleVisionMaximumCost);
    });
})