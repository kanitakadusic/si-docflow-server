import { Request, Response } from 'express';

import { OcrService } from '../services/ocr.service.js';
import { DocumentPreprocessorService } from '../services/documentPreprocessor.service.js';
import { IField } from '../database/models/documentLayout.model.js';
import { DocumentLayout, DocumentType, LayoutImage } from '../database/db.js';

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
    private readonly documentPreprocessorService = new DocumentPreprocessorService();

    async process(req: DocumentWithMetadataRequest, res: Response): Promise<void> {
        try {
            const { file } = req;
            const { user, pc, type } = req.body;
            // ?lang=bos
            // ?engines=tesseract,googleVision,chatGpt
            const { lang, engines } = req.query;

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
            if (!engines) {
                res.status(400).json({ message: 'Engines have not been specified' });
                return;
            }

            const documentType = await DocumentType.findOne({
                where: { name: type },
                include: [
                    {
                        model: DocumentLayout,
                        as: 'documentLayout',
                        include: [
                            {
                                model: LayoutImage,
                                as: 'layoutImage',
                            },
                        ],
                    },
                ],
            });
            if (!documentType) {
                res.status(404).json({ message: `Document type '${type}' is not available` });
                return;
            }

            const documentLayout = documentType.documentLayout;
            if (!documentLayout) {
                res.status(404).json({ message: `Document layout for document type '${type}' is not available` });
                return;
            }

            const layoutImage = documentLayout.layoutImage;
            if (!layoutImage) {
                res.status(404).json({ message: `Layout image for document type '${type}' is not available` });
                return;
            }

            const preprocessedDocument: Buffer = await this.documentPreprocessorService.prepareDocumentForOcr(
                file.buffer,
                file.mimetype,
                Math.round(layoutImage.dataValues.width),
                Math.round(layoutImage.dataValues.height),
            );

            const fields: IField[] = documentLayout.getFields();

            const ocrEngines: string[] = engines.toString().split(',');
            const results = [];

            for (const ocrEngine of ocrEngines) {
                const result = await this.ocrService.runOcr(preprocessedDocument, fields, ocrEngine, lang.toString());
                results.push({ engine: ocrEngine, ocr: result });
            }

            res.status(200).json({
                data: results,
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
