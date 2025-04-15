import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { AccessRight } from '../database/db';

export const verifyToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }

        const activeRecords = await AccessRight.findAll({
            where: { is_active: true },
            attributes: ['token'],
        });

        for (const activeRecord of activeRecords) {
            const isMatch = await bcrypt.compare(token, activeRecord.token);
            if (isMatch) {
                console.log('Token verified');
                next();
                return;
            }
        }

        res.status(401).json({ message: 'Invalid token' });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({ message: 'Server error during token verification' });
    }
};
