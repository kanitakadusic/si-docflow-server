// test/controllers/documentType.controller.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DocumentTypeController } from '../../src/controllers/documentType.controller';

vi.mock('../../src/services/documentType.service', () => ({
    DocumentTypeService: vi.fn().mockImplementation(() => ({
        getAll: vi.fn(),
    })),
}));

describe('DocumentTypeController', () => {
    let controller: DocumentTypeController;
    let req: any;
    let res: any;
    let mockService: any;

    beforeEach(() => {
        controller = new DocumentTypeController();

        mockService = (controller as any).documentTypeService;

        req = {};
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
    });

    it('should return 200 and list of document types on success', async () => {
        const fakeTypes = [
            { id: 1, name: 'Invoice' },
            { id: 2, name: 'Form' },
        ];
        mockService.getAll.mockResolvedValue(fakeTypes);

        await controller.getAll(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            data: fakeTypes,
            message: 'Document types have been successfully fetched',
        });
    });

    it('should return 500 if an error occurs', async () => {
        mockService.getAll.mockRejectedValue(new Error('Fetch error'));

        await controller.getAll(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Server error while fetching document types',
        });
    });
});
