import { Request, Response } from 'express';

import { OcrService } from '../services/ocr.service.js';
import { DocumentTypeService } from '../services/documentType.service.js';
import { DocumentLayoutService } from '../services/documentLayout.service.js';
import { LayoutImageService } from '../services/layoutImage.service.js';
import { DocumentPreprocessorService } from '../services/documentPreprocessor.service.js';
import { IField } from '../database/models/documentLayout.model.js';

interface DocumentWithMetadataRequest extends Request {
    file?: Express.Multer.File;
    body: {
        user: string;
        pc: string;
        type: string;
    };
}

export class DocumentController {
    private readonly ocrService = new OcrService();
    private readonly documentTypeService = new DocumentTypeService();
    private readonly documentLayoutService = new DocumentLayoutService();
    private readonly layoutImageService = new LayoutImageService();
    private readonly documentPreprocessorService = new DocumentPreprocessorService();

    async process(req: DocumentWithMetadataRequest, res: Response): Promise<void> {
        try {
            const { file } = req;
            const { user, pc, type } = req.body;
            const { lang } = req.query;

            if (!file) {
                res.status(400).json({ message: 'Document has not been uploaded' });
                return;
            }
            if (!user || !pc || !type) {
                res.status(400).json({ message: 'Metadata (user, pc, type) is missing' });
                return;
            }
            if (!lang) {
                res.status(400).json({ message: 'Language has not been specified' });
                return;
            }

            const documentType = await this.documentTypeService.getByName(type);
            if (!documentType) {
                res.status(404).json({ message: `Document type '${type}' is not available` });
                return;
            }

            if (!documentType.dataValues.document_layout_id) {
                res.status(404).json({ message: `Document layout id for document type '${type}' is not available` });
                return;
            }
            const documentLayout = await this.documentLayoutService.getById(documentType.dataValues.document_layout_id);
            if (!documentLayout) {
                res.status(404).json({ message: `Document layout for document type '${type}' is not available` });
                return;
            }

            const layoutImage = await this.layoutImageService.getById(documentLayout.dataValues.image_id);
            if (!layoutImage) {
                res.status(404).json({ message: `Layout image for document type '${type}' is not available` });
                return;
            }

            const preprocessedDocument: Buffer = await this.documentPreprocessorService.prepareDocumentForOcr(
                file.buffer,
                file.mimetype,
                Math.round(layoutImage.dataValues.width), //does not work if width and height float numbers
                Math.round(layoutImage.dataValues.height),
            );

            const fields: IField[] = JSON.parse(documentLayout.dataValues.fields);

            const ocrResult = await this.ocrService.extractFields(preprocessedDocument, fields, lang.toString());

            res.status(200).json({
                data: ocrResult,
                message: 'Document has been successfully processed',
            });
        } catch (error) {
            console.error('Error processing document:', error);
            res.status(500).json({
                message: 'Server error while processing document',
            });
        }
    }
}
