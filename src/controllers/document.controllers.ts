import { Request, Response } from 'express';

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

		// handle document and metadata
		console.log('Document:', file.originalname);
		console.log('Metadata:', { user, pc, type });

		res.status(200).json({
			message: 'Document and metadata have been successfully received',
		});
	} catch (error) {
		console.error('Error receiving document and metadata:', error);
		res.status(500).json({
			message: 'Server error while receiving document and metadata',
		});
	}
};
