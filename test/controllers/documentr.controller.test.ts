// test/controllers/document.controller.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DocumentController } from '../../src/controllers/document.controller';

vi.mock('../../src/services/ocr.service', () => ({
    OcrService: vi.fn().mockImplementation(() => ({
        runOcr: vi.fn().mockResolvedValue([{ name: 'Name', value: 'Jane Doe' }]),
    })),
}));

vi.mock('../../src/services/documentType.service', () => ({
    DocumentTypeService: vi.fn().mockImplementation(() => ({
        getByName: vi.fn().mockResolvedValue({
            dataValues: { document_layout_id: 1 },
        }),
    })),
}));

vi.mock('../../src/services/documentLayout.service', () => ({
    DocumentLayoutService: vi.fn().mockImplementation(() => ({
        getById: vi.fn().mockResolvedValue({
            dataValues: {
                fields: JSON.stringify([{ name: 'Name', bbox: [0, 0, 10, 10] }]),
                image_id: 123,
            },
        }),
    })),
}));

vi.mock('../../src/services/layoutImage.service', () => ({
    LayoutImageService: vi.fn().mockImplementation(() => ({
        getById: vi.fn().mockResolvedValue({
            dataValues: { width: 200, height: 100 },
        }),
    })),
}));

vi.mock('../../src/services/documentPreprocessor.service', () => ({
    DocumentPreprocessorService: vi.fn().mockImplementation(() => ({
        prepareDocumentForOcr: vi.fn().mockResolvedValue(Buffer.from('fakeBuffer')),
    })),
}));

describe('DocumentController', () => {
    let controller: DocumentController;
    let req: any;
    let res: any;

    beforeEach(() => {
        controller = new DocumentController();
        req = {
            file: { buffer: Buffer.from('test'), mimetype: 'image/png' },
            body: { user: 'testuser', pc: 'testpc', type: 'invoice' },
            query: { lang: 'en' },
        };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
    });

    it('should return 200 and data on success', async () => {
        await controller.process(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            data: [
                { engine: 'tesseract', result: [{ name: 'Name', value: 'Jane Doe' }] },
                { engine: 'googleVision', result: [{ name: 'Name', value: 'Jane Doe' }] },
                { engine: 'chatGpt', result: [{ name: 'Name', value: 'Jane Doe' }] },
            ],
            message: 'Document has been successfully processed',
        });
    });

    it('should return 400 if file is missing', async () => {
        req.file = undefined;
        await controller.process(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Document has not been uploaded' });
    });

    it('should return 400 if metadata is missing', async () => {
        req.body.user = '';
        await controller.process(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Metadata (user, pc, type) is missing' });
    });

    it('should return 400 if metadata is missing', async () => {
        req.body = { pc: 'pc1', type: 'formular' } as any; // no user
        await controller.process(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Metadata (user, pc, type) is missing' });
    });

    it('should return 400 if metadata is missing', async () => {
        req.body = { user: 'u1', type: 'formular' } as any; // no pc
        await controller.process(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Metadata (user, pc, type) is missing' });
    });

    it('should return 400 if metadata is missing', async () => {
        req.body = { user: 'u1', pc: 'pc1' } as any; // no type
        await controller.process(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Metadata (user, pc, type) is missing' });
    });

    it('should return 400 if metadata is missing', async () => {
        req.body = { type: 'formular' } as any; // no user, no pc
        await controller.process(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Metadata (user, pc, type) is missing' });
    });

    it('should return 400 if metadata is missing', async () => {
        req.body = { pc: 'pc1' } as any; // no user, no type
        await controller.process(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Metadata (user, pc, type) is missing' });
    });

    it('should return 400 if metadata is missing', async () => {
        req.body = { user: 'u1' } as any; // no pc, no type
        await controller.process(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Metadata (user, pc, type) is missing' });
    });

    it('should return 400 if lang is missing', async () => {
        req.query.lang = undefined;
        await controller.process(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Language has not been specified' });
    });

    it('should return 404 if document type is not found', async () => {
        const mockedService = controller['documentTypeService'] as any;
        mockedService.getByName.mockResolvedValueOnce(null);

        await controller.process(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: "Document type 'invoice' is not available",
        });
    });

    it('should return 404 if document layout is not found', async () => {
        const dtService = controller['documentTypeService'] as any;
        const dlService = controller['documentLayoutService'] as any;

        dtService.getByName.mockResolvedValueOnce({
            dataValues: { document_layout_id: 1 },
        });
        dlService.getById.mockResolvedValueOnce(null);

        await controller.process(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: "Document layout for document type 'invoice' is not available",
        });
    });

    it('should return 404 if layout image is not found', async () => {
        const dtService = controller['documentTypeService'] as any;
        const dlService = controller['documentLayoutService'] as any;
        const liService = controller['layoutImageService'] as any;

        dtService.getByName.mockResolvedValueOnce({
            dataValues: { document_layout_id: 1 },
        });
        dlService.getById.mockResolvedValueOnce({
            dataValues: {
                fields: JSON.stringify([{ name: 'Name', bbox: [0, 0, 10, 10] }]),
                image_id: 123,
            },
        });
        liService.getById.mockResolvedValueOnce(null);

        await controller.process(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: "Layout image for document type 'invoice' is not available",
        });
    });

    it('should return 500 if an exception is thrown', async () => {
        const ocrService = controller['ocrService'] as any;
        ocrService.runOcr.mockRejectedValueOnce(new Error('OCR failure'));

        await controller.process(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Server error while processing document',
        });
    });
});
