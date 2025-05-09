import { Request, Response } from 'express';

import { DocumentPreprocessorService } from '../services/documentPreprocessor.service.js';
import { OcrService } from '../services/ocr.service.js';
import { IField } from '../types/model.js';
import {
    DocumentLayout,
    DocumentType,
    ExternalApiEndpoint,
    ExternalFtpEndpoint,
    LayoutImage,
    LocalStorageFolder,
    ProcessingRule,
    ProcessingRuleDestination,
} from '../config/db.js';

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
            const json = req.body;

            if (!json) {
                res.status(400).json({ message: 'Data for finalization is missing' });
                return;
            }
            if (!json.document_type_id) {
                res.status(400).json({ message: 'Document type has not been specified' });
                return;
            }

            const processingRules = await ProcessingRule.findAll({
                where: { document_type_id: json.document_type_id },
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

            const logs = {
                storages: [] as { id: number; success: boolean }[],
                apis: [] as { id: number; success: boolean }[],
                ftps: [] as { id: number; success: boolean }[],
            };

            for (const rule of processingRules) {
                if (!rule.processingRuleDestinations) continue;

                for (const destination of rule.processingRuleDestinations) {
                    if (destination.localStorageFolder) {
                        logs.storages.push({
                            id: destination.localStorageFolder.dataValues.id,
                            success: await destination.localStorageFolder.send(json),
                        });
                    } else if (destination.externalApiEndpoint) {
                        logs.apis.push({
                            id: destination.externalApiEndpoint.dataValues.id,
                            success: await destination.externalApiEndpoint.send(json),
                        });
                    } else if (destination.externalFtpEndpoint) {
                        logs.ftps.push({
                            id: destination.externalFtpEndpoint.dataValues.id,
                            success: await destination.externalFtpEndpoint.send(json),
                        });
                    }
                }
            }

            res.status(200).json({
                data: logs,
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
