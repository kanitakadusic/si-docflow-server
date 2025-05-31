// test/controllers/documentType.controller.test.ts
import { describe, it, expect, beforeEach, vi, afterEach, Mock } from 'vitest';
import { DocumentTypeController } from '../../src/controllers/documentType.controller';
import { DocumentType } from '../../src/config/db';

vi.mock('../../src/config/db', () => ({
  DocumentType: {
    findAll: vi.fn(),
  },
}));

describe('DocumentTypeController', () => {
    let controller: DocumentTypeController;
    let req: any;
    let res: any;

    beforeEach(() => {
        controller = new DocumentTypeController();

        req = {};
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should return 200 and list of document types on success', async () => {
        const fakeTypes = [
            { id: 1, name: 'Invoice' },
            { id: 2, name: 'Form' },
        ];

        (DocumentType.findAll as Mock).mockResolvedValue(fakeTypes);
        await controller.getAll(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            data: fakeTypes,
            message: 'Document types have been successfully fetched',
        });
    });

    it('should return 500 if an error occurs', async () => {
      (DocumentType.findAll as Mock).mockRejectedValue(new Error('Fetch error'));

        await controller.getAll(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Server error while fetching document types',
        });
    });
});
