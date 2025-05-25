import { assert, expect, test, describe, beforeAll, it } from 'vitest';
import { DocumentLayout, LayoutImage } from "../../src/database/db.js";
import { OcrService } from "../../src/services/ocr.service.js";
import { DocumentPreprocessorService } from "../../src/services/documentPreprocessor.service.js"
import { IField } from "../../src/types/ocr.js";

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
        layoutImage = (await LayoutImage.findByPk(documentLayout.image_id))!;
        document = fs.readFileSync(path.join(__dirname, "..", "resources", documentName));
        processedDocument = await documentPreprocessorService.extractDocumentFromPhoto(document, layoutImage.width, layoutImage.height);
        documentLayout.get()
    });

    it('should return cost lower than chat gpt maximum cost', async() => {
        let result = await ocrService.runOcr(processedDocument, documentLayout.fields as unknown as IField[], "chatGpt", "bos");

    });
})