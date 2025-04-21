import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';

import { AccessRightService } from '../services/accessRight.service.js';

export class AuthMiddleware {
    private readonly accessRightService = new AccessRightService();

    async verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const token = req.headers.authorization;
            if (!token) {
                res.status(401).json({ message: 'No token provided' });
                return;
            }

            const activeRecords = await this.accessRightService.getAllActive();

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
    }
}
