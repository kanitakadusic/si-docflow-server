import { Request, Response } from 'express';

import { DocumentLayout } from '../database/db.js';

export class DocumentLayoutController {
    async getAll(_: Request, res: Response): Promise<void> {
        try {
            const layouts = await DocumentLayout.findAll();
            res.status(200).json({
                data: layouts,
                message: 'Document layouts have been successfully fetched',
            });
        } catch (error) {
            console.error('Error fetching document layouts:', error);
            res.status(500).json({ message: 'Server error while fetching document layouts' });
        }
    }
}
