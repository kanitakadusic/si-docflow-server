import { Request, Response } from 'express';
import db from '../database/db';

export const getDocumentTypes = async (_: Request, res: Response): Promise<void> => {
	try {
		const types = await db.documentTypes.findAll({
			attributes: ['id', 'name', 'description'],
		});
		res.status(200).json({
			data: types,
			message: 'Document types have been successfully fetched',
		});
	} catch (error) {
		console.error('Error fetching document types:', error);
		res.status(500).json({ message: 'Server error while fetching document types' });
	}
};
