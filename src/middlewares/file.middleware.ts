import { NextFunction, Request, Response } from 'express';
import sharp from 'sharp';

export class FileMiddleware {
    async resizeImage(req: Request, res: Response, next: NextFunction): Promise<void> {
        console.log('----------');
        console.log(`resizeImage: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`);

        if (!req.file) return next();

        const mime = req.file.mimetype || '';
        if (!mime.startsWith('image/')) return next();

        try {
            const resizedBuffer = await sharp(req.file.buffer)
                .resize({ width: 1000, withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toBuffer();

            req.file.buffer = resizedBuffer;
            req.file.size = resizedBuffer.length;
            req.file.mimetype = 'image/jpeg';
        } catch (error) {
            console.error('Image resizing failed:', error);
        }

        next();
    }
}
