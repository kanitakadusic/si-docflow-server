// test/controllers/documentLayout.controller.test.ts
import { describe, it, expect, beforeEach, vi, afterEach, Mock } from 'vitest';
import { DocumentLayoutController } from '../../src/controllers/documentLayout.controller';
import { DocumentLayout } from '../../src/config/db'

vi.mock('../../src/config/db', () => ({
  DocumentLayout: {
    findAll: vi.fn(),
  },
}));

describe('DocumentLayoutController', () => {
    let controller: DocumentLayoutController;
    let req: any;
    let res: any;

    beforeEach(() => {
        controller = new DocumentLayoutController();

        req = {};
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should return 200 and list of layouts on success', async () => {
        const fakeLayouts = [
            { id: 1, name: 'Layout A' },
            { id: 2, name: 'Layout B' },
        ];

        (DocumentLayout.findAll as Mock).mockResolvedValue(fakeLayouts);
        await controller.getAll(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            data: fakeLayouts,
            message: 'Document layouts have been successfully fetched',
        });
    });

    it('should return 500 if an error occurs', async () => {

        (DocumentLayout.findAll as Mock).mockRejectedValue(new Error('DB failure'));
        await controller.getAll(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Server error while fetching document layouts',
        });
    });
});
