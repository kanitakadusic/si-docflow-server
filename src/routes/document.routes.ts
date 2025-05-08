import express from 'express';
import multer from 'multer';

import { DocumentController } from '../controllers/document.controller.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const ocrController = new DocumentController();
const authMiddleware = new AuthMiddleware();

router.post('/process', upload.single('file'), ocrController.process.bind(ocrController));
router.post(
    '/process/auth',
    authMiddleware.verifyToken.bind(authMiddleware),
    upload.single('file'),
    ocrController.process.bind(ocrController),
);

router.post('/finalize', ocrController.finalize.bind(ocrController));
router.post(
    '/finalize/auth',
    authMiddleware.verifyToken.bind(authMiddleware),
    ocrController.finalize.bind(ocrController),
);

export default router;
