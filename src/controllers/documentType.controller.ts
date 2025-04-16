import { Request, Response } from 'express';
import { DocumentTypeService } from '../services/documentType.service';

export class DocumentTypeController {
    private readonly documentTypeService = new DocumentTypeService();

    async getAll(_: Request, res: Response): Promise<void> {
        try {
            const types = await this.documentTypeService.getAll();
            res.status(200).json({
                data: types,
                message: 'Document types have been successfully fetched',
            });
        } catch (error) {
            console.error('Error fetching document types:', error);
            res.status(500).json({ message: 'Server error while fetching document types' });
        }
    }
}
