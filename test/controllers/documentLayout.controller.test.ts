// test/controllers/documentLayout.controller.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DocumentLayoutController } from '../../src/controllers/documentLayout.controller';

vi.mock('../../src/services/documentLayout.service', () => ({
    DocumentLayoutService: vi.fn().mockImplementation(() => ({
        getAll: vi.fn(),
    })),
}));

describe('DocumentLayoutController', () => {
    let controller: DocumentLayoutController;
    let req: any;
    let res: any;
    let mockService: any;

    beforeEach(() => {
        controller = new DocumentLayoutController();

        mockService = (controller as any).documentLayoutService;

        req = {};
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
    });

    it('should return 200 and list of layouts on success', async () => {
        const fakeLayouts = [
            { id: 1, name: 'Layout A' },
            { id: 2, name: 'Layout B' },
        ];
        mockService.getAll.mockResolvedValue(fakeLayouts);

        await controller.getAll(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            data: fakeLayouts,
            message: 'Document layouts have been successfully fetched',
        });
    });

    it('should return 500 if an error occurs', async () => {
        mockService.getAll.mockRejectedValue(new Error('DB error'));

        await controller.getAll(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Server error while fetching document layouts',
        });
    });
});
