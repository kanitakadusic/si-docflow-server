import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import db from '../database/db';

export const verifyToken = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	try {
		const token = req.headers.authorization;

		if (!token ) {
			res.status(401).json({ message: 'No token provided.' });
			return;
		}

		const tokenRecord = await db.accessRights.findOne({
			where: { is_active: true },
		});

		if (!tokenRecord || !tokenRecord.token) {
			res.status(401).json({ message: 'No active token found in database' });
			return;
		}

		const isMatch = await bcrypt.compare(token, tokenRecord.token);

		if (!isMatch) {
			res.status(401).json({ message: 'Invalid token' });
			return;
		}

		console.log('Token verified');
		next();
	} catch (error) {
		console.error('Token verification error:', error);
		res.status(500).json({ message: 'Server error during token verification' });
	}
};
