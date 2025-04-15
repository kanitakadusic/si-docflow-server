import { Request, Response } from 'express';
import { extractData } from '../services/ocr.service';

interface DocumentWithMetadataRequest extends Request {
    file?: Express.Multer.File;
    body: {
        user: string;
        pc: string;
        type: string;
    };
}

export const postDocumentWithMetadata = async (
    req: DocumentWithMetadataRequest,
    res: Response,
): Promise<void> => {
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

        let ocrResult = await extractData(file.buffer);

        res.status(200).json({
            data: {
                name: file.originalname,
                type: type,
                fields: ocrResult,
            },
            message: 'Document and metadata have been successfully received',
        });
    } catch (error) {
        console.error('Error receiving document and metadata:', error);
        res.status(500).json({
            message: 'Server error while receiving document and metadata',
        });
    }
};
