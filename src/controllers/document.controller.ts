import { Request, Response } from 'express';

import { DocumentPreprocessorService } from '../services/documentPreprocessor.service.js';
import { OcrService } from '../services/ocr.service.js';
import { IField } from '../database/models/documentLayout.model.js';
import {
    DocumentLayout,
    DocumentType,
    ExternalApiEndpoint,
    ExternalFtpEndpoint,
    LayoutImage,
    LocalStorageFolder,
    ProcessingRule,
    ProcessingRuleDestination,
} from '../database/db.js';

interface DocumentWithMetadataRequest extends Request {
    file?: Express.Multer.File;
    body: {
        user: string;
        machineId: string;
        documentTypeId: string;
    };
}

export class DocumentController {
    private readonly documentPreprocessorService = new DocumentPreprocessorService();
    private readonly ocrService = new OcrService();

    async process(req: DocumentWithMetadataRequest, res: Response): Promise<void> {
        try {
            const { file } = req;
            const { user, machineId, documentTypeId } = req.body;
            // ?lang=bos
            // ?engines=tesseract,googleVision,chatGpt
            const { lang, engines } = req.query;

            if (!file) {
                res.status(400).json({ message: 'Document has not been uploaded' });
                return;
            }
            if (!user || !machineId || !documentTypeId) {
                res.status(400).json({ message: 'Metadata (user, machine id, document type id) is missing' });
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

            const documentType = await DocumentType.findByPk(parseInt(documentTypeId, 10), {
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
                res.status(404).json({ message: `Document type (${documentTypeId}) is not available` });
                return;
            }

            const documentLayout = documentType.documentLayout;
            if (!documentLayout) {
                res.status(404).json({
                    message: `Document layout for document type (${documentTypeId}) is not available`,
                });
                return;
            }

            const layoutImage = documentLayout.layoutImage;
            if (!layoutImage) {
                res.status(404).json({
                    message: `Layout image for document type (${documentTypeId}) is not available`,
                });
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

    async finalize(req: Request, res: Response): Promise<void> {
        try {
            const data = req.body;

            if (!data) {
                res.status(400).json({ message: 'Data for finalization is missing' });
                return;
            }
            if (!data.documentTypeId) {
                res.status(400).json({ message: 'Document type has not been specified' });
                return;
            }

            const processingRules = await ProcessingRule.findAll({
                where: { document_type_id: data.documentTypeId },
                include: [
                    {
                        model: ProcessingRuleDestination,
                        as: 'processingRuleDestinations',
                        include: [
                            {
                                model: LocalStorageFolder,
                                as: 'localStorageFolder',
                            },
                            {
                                model: ExternalApiEndpoint,
                                as: 'externalApiEndpoint',
                            },
                            {
                                model: ExternalFtpEndpoint,
                                as: 'externalFtpEndpoint',
                            },
                        ],
                    },
                ],
            });

            const totals = {
                total_storage_destinations: 0,
                total_api_destinations: 0,
                total_ftp_destinations: 0,
            };

            for (const rule of processingRules) {
                if (rule.processingRuleDestinations) {
                    for (const destination of rule.processingRuleDestinations) {
                        if (destination.localStorageFolder) {
                            totals.total_storage_destinations++;
                            await destination.localStorageFolder.send(data);
                        } else if (destination.externalApiEndpoint) {
                            totals.total_api_destinations++;
                            await destination.externalApiEndpoint.send(data);
                        } else if (destination.externalFtpEndpoint) {
                            totals.total_ftp_destinations++;
                            await destination.externalFtpEndpoint.send(data);
                        }
                    }
                }
            }

            res.status(200).json({
                data: totals,
                message: 'Document has been successfully finalized',
            });
        } catch (error) {
            console.error('Error finalizing document:', error);
            res.status(500).json({
                message: 'Server error while finalizing document',
            });
        }
    }
}
