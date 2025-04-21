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

            if (!file) {
                res.status(400).json({ message: 'Document has not been uploaded' });
                return;
            }
            if (!user || !pc || !type) {
                res.status(400).json({ message: 'Metadata (user, pc, type) is missing' });
                return;
            }

            const documentType = await this.documentTypeService.getByName(type);
            if (!documentType) {
                res.status(404).json({ message: `Document type '${type}' is not available` });
                return;
            }

            const documentLayouts = await this.documentLayoutService.getAllByDocumentTypeId(documentType.dataValues.id);
            if (!documentLayouts.length) {
                res.status(404).json({ message: `Document layouts for document type '${type}' are not available` });
                return;
            }

            // check with the client and coordinate with admin dashboard dev team
            const documentLayout = documentLayouts[0];

            const layoutImage = await this.layoutImageService.getById(documentLayout.dataValues.image_id);
            if (!layoutImage) {
                res.status(404).json({ message: `Layout image for document type '${type}' is not available` });
                return;
            }

            const preprocessedDocument: Buffer = await this.documentPreprocessorService.prepareDocumentForOcr(
                file.buffer,
                file.mimetype,
                layoutImage.dataValues.width,
                layoutImage.dataValues.height,
            );

            const fields: IField[] = JSON.parse(documentLayout.dataValues.fields);

            const ocrResult = await this.ocrService.extractFields(preprocessedDocument, fields);

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
