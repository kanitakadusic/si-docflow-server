import express from 'express';
import multer from 'multer';

import { DocumentController } from '../controllers/document.controller.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const ocrController = new DocumentController();
const authMiddleware = new AuthMiddleware();

router.post('/', upload.single('file'), ocrController.process.bind(ocrController));
router.post(
    '/auth',
    authMiddleware.verifyToken.bind(authMiddleware),
    upload.single('file'),
    ocrController.process.bind(ocrController),
);

export default router;
