// test/controllers/document.controller.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DocumentController } from '../../src/controllers/document.controller';
import { Request, Response } from 'express';

vi.mock('../../src/services/ocr.service', () => ({
    OcrService: vi.fn().mockImplementation(() => ({
        runOcr: vi.fn().mockResolvedValue([
            {
                image: 'imageBuffer',
                mappedResult: {
                    result: { text: 'Jane Doe', price: 1.0 },
                },
            },
        ]),
    })),
}));

vi.mock('../../src/services/documentPreprocessor.service', () => ({
    DocumentPreprocessorService: vi.fn().mockImplementation(() => ({
        prepareDocumentForOcr: vi.fn().mockResolvedValue(Buffer.from('fakeBuffer')),
    })),
}));

vi.mock('../../src/config/db.js', async () => {
    const actual = await vi.importActual<any>('../../src/config/db.js');
    return {
        ...actual,
        DocumentType: {
            findByPk: vi.fn().mockResolvedValue({
                documentLayout: {
                    getFields: () => [{ name: 'Name', bbox: [0, 0, 10, 10] }],
                    layoutImage: { dataValues: { width: 200, height: 100 } },
                },
            }),
        },
        AiProvider: {
            findOne: vi.fn().mockResolvedValue({ id: 1, name: 'mockProvider' }),
        },
        ProcessingRequestBillingLog: {
            create: vi.fn().mockResolvedValue(undefined),
        },
        ProcessingResultsTriplet: {
            create: vi.fn().mockImplementation(async ({ image, ai_data, user_data }) => ({ id: 1 })),
            update: vi.fn().mockResolvedValue(undefined),
        },
        ProcessingRule: {
            findAll: vi.fn().mockResolvedValue([
                {
                    processingRuleDestinations: [
                        {
                            localStorageFolder: {
                                dataValues: { id: 1 },
                                send: vi.fn().mockResolvedValue(true),
                            },
                            externalApiEndpoint: null,
                            externalFtpEndpoint: null,
                        },
                    ],
                },
            ]),
        },
    };
});

describe('DocumentController', () => {
    let controller: DocumentController;
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        controller = new DocumentController();
        req = {
            file: { buffer: Buffer.from('test'), mimetype: 'image/png', originalname: 'test.png' },
            body: { user: 'testuser', machineId: 'testmachine', documentTypeId: '1' },
            query: { lang: 'en', engines: 'tesseract,googleVision,chatGpt' },
        } as any;
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
    });

    it('should return 200 and data on success', async () => {
        await controller.process(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            data: expect.any(Array),
            message: 'Document has been successfully processed',
        });
    });

    it('should return 400 if file is missing', async () => {
        req.file = undefined;
        await controller.process(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Document has not been uploaded' });
    });

    it('should return 400 if metadata is missing', async () => {
        req.body = { user: '', machineId: '', documentTypeId: '' };
        await controller.process(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if engines is missing', async () => {
        req.query = { lang: 'en' };
        delete req.query.engines;
        await controller.process(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Engines have not been specified' });
    });

    it('should return 400 if lang is missing', async () => {
        req.query = { engines: 'tesseract,googleVision,chatGpt' };
        delete req.query.engines;
        await controller.process(req as Request, res as Response);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Language has not been specified' });
    });

    it('should return 404 if document type not found', async () => {
        const db = await import('../../src/config/db.js');
        (db.DocumentType.findByPk as any).mockResolvedValue(null);

        await controller.process(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: `Document type (1) is not available`,
        });
    });

    it('should return 404 if document layout not found', async () => {
        const db = await import('../../src/config/db.js');
        (db.DocumentType.findByPk as any).mockResolvedValue({ documentLayout: null });

        await controller.process(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: `Document layout for document type (1) is not available`,
        });
    });

    it('should return 404 if layout image not found', async () => {
        const db = await import('../../src/config/db.js');
        (db.DocumentType.findByPk as any).mockResolvedValue({
            documentLayout: {
                layoutImage: null,
            },
        });

        await controller.process(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: `Layout image for document type (1) is not available`,
        });
    });

    it('should return 500 if OCR fails', async () => {
        const db = await import('../../src/config/db.js');
        const layoutImageMock = {
            dataValues: { width: 200, height: 100 },
        };

        const documentLayoutMock = {
            layoutImage: layoutImageMock,
            getFields: () => [{ name: 'Name', bbox: [0, 0, 10, 10] }],
        };

        const documentTypeMock = {
            documentLayout: documentLayoutMock,
        };

        (db.DocumentType.findByPk as any).mockResolvedValue(documentTypeMock);

        const ocrService = controller['ocrService'] as any;
        ocrService.runOcr.mockRejectedValueOnce(new Error('OCR failed'));

        await controller.process(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Server error while processing document',
        });
    });

    describe('finalize', () => {
        it('should return 200 and logs on success', async () => {
            const finalizeReq = {
                body: {
                    document_type_id: 1,
                    ocr: [
                        {
                            result: {
                                text: 'Finalized text',
                            },
                        },
                    ],
                    tripletIds: [1],
                },
            } as any;

            await controller.finalize(finalizeReq as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                data: {
                    storages: [{ id: 1, is_sent: true }],
                    apis: [],
                    ftps: [],
                },
                message: 'Document has been successfully finalized',
            });
        });

        it('should return 400 if no body', async () => {
            const finalizeReq = { body: null } as any;
            await controller.finalize(finalizeReq as Request, res as Response);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Data for finalization is missing' });
        });

        it('should return 400 if document_type_id is missing', async () => {
            const finalizeReq = { body: { ocr: [], tripletIds: [] } } as any;
            await controller.finalize(finalizeReq as Request, res as Response);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Document type has not been specified' });
        });
    });
});
