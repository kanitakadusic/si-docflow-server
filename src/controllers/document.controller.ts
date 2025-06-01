import { Request, Response } from 'express';

import { DocumentPreprocessorService } from '../services/documentPreprocessor.service.js';
import { OcrService } from '../services/ocr.service.js';
import { IField } from '../types/model.js';
import { IMappedOcrResult, IMappedOcrResultFinalized, IMappedOcrResultWithCrop } from '../types/ocr.js';
import {
    AiProvider,
    DocumentLayout,
    DocumentType,
    ExternalApiEndpoint,
    ExternalFtpEndpoint,
    LayoutImage,
    LocalStorageFolder,
    ProcessingRequestsBillingLog,
    ProcessingResultsTriplet,
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

            const aiProviders = await Promise.all(
                engines
                    .toString()
                    .split(',')
                    .map((engine) => AiProvider.findOne({ where: { name: engine } })),
            );
            if (aiProviders.every((aiProvider) => aiProvider === null)) {
                res.status(404).json({
                    message: `Provided OCR engines are not supported`,
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

            const finalResults = [];

            for (const aiProvider of aiProviders) {
                if (!aiProvider) {
                    continue;
                }

                const resultsWithCrop: IMappedOcrResultWithCrop[] = await this.ocrService.runOcr(
                    preprocessedDocument,
                    fields,
                    aiProvider.dataValues.name,
                    lang.toString(),
                );

                if (aiProvider.dataValues.name != 'tesseract') {
                    await ProcessingRequestsBillingLog.create({
                        document_type_id: documentType.id,
                        ai_provider_id: aiProvider.id,
                        price: resultsWithCrop.reduce((sum, resultWithCrop) => sum + resultWithCrop.result.price, 0),
                    });
                }

                const tripletIds = await this.logImageAndAiData(resultsWithCrop, aiProvider.id);

                finalResults.push({
                    engine: aiProvider.dataValues.name,
                    ocr: resultsWithCrop.map(({ fieldWithCrop, result }) => ({
                        field: {
                            name: fieldWithCrop.name,
                            upper_left: fieldWithCrop.upper_left,
                            lower_right: fieldWithCrop.lower_right,
                            is_multiline: fieldWithCrop.is_multiline,
                        },
                        result,
                    })) as IMappedOcrResult[],
                    tripletIds,
                });
            }

            res.status(200).json({
                data: finalResults,
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

            await this.logUserData(json.ocr as IMappedOcrResultFinalized[], json.tripletIds);

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
                storages: [] as { id: number; is_sent: boolean }[],
                apis: [] as { id: number; is_sent: boolean }[],
                ftps: [] as { id: number; is_sent: boolean }[],
            };

            for (const rule of processingRules) {
                if (!rule.processingRuleDestinations) continue;

                for (const destination of rule.processingRuleDestinations) {
                    if (destination.localStorageFolder) {
                        logs.storages.push({
                            id: destination.localStorageFolder.dataValues.id,
                            is_sent: await destination.localStorageFolder.send(json),
                        });
                    } else if (destination.externalApiEndpoint) {
                        logs.apis.push({
                            id: destination.externalApiEndpoint.dataValues.id,
                            is_sent: await destination.externalApiEndpoint.send(json),
                        });
                    } else if (destination.externalFtpEndpoint) {
                        logs.ftps.push({
                            id: destination.externalFtpEndpoint.dataValues.id,
                            is_sent: await destination.externalFtpEndpoint.send(json),
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

    private async logImageAndAiData(results: IMappedOcrResultWithCrop[], aiProviderId: number): Promise<number[]> {
        const tripletIds = [];
        for (const result of results) {
            const triplet = await ProcessingResultsTriplet.create({
                image: result.fieldWithCrop.crop,
                ai_data: result.result.text,
                user_data: '',
                ai_provider_id: aiProviderId,
            });
            tripletIds.push(triplet.id);
        }
        return tripletIds;
    }

    private async logUserData(results: IMappedOcrResultFinalized[], tripletIds: number[]) {
        for (let i = 0; i < tripletIds.length; i++) {
            await ProcessingResultsTriplet.update(
                { user_data: results[i].result.text },
                {
                    where: {
                        id: tripletIds[i],
                    },
                },
            );
        }
    }
}
