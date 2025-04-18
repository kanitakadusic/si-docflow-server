import { Request, Response } from 'express';
import { OcrService } from '../services/ocr.service';
import { DocumentLayoutService } from '../services/documentLayout.service';
interface DocumentWithMetadataRequest extends Request {
    file?: Express.Multer.File;
    body: {
        user: string;
        pc: string;
        type: string;
    };
}

export class OcrController {
    private readonly ocrService = new OcrService();
    private readonly documentLayoutService = new DocumentLayoutService();

    async processDocument(req: DocumentWithMetadataRequest, res: Response): Promise<void> {
        try {
            const { file } = req;
            const { user, pc, type } = req.body;

            if (!file) {
                res.status(400).json({ message: 'Document has not been uploaded' });
                return;
            }
            if (!user || !pc || !type) {
                res.status(400).json({ message: 'Metadata (user, pc, type) is missing' });
                return;
            }

            const ocrResult = await this.ocrService.extractFields(file.buffer, file.mimetype, type);

            res.status(200).json({
                data: ocrResult,
                message: 'Document and metadata have been successfully received',
            });
        } catch (error) {
            console.error('Error receiving document and metadata:', error);
            res.status(500).json({
                message: 'Server error while receiving document and metadata',
            });
        }
    }
}
