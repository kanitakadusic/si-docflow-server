import express from 'express';
import multer from 'multer';
import { OcrController } from '../controllers/ocr.controller';
import { verifyToken } from '../middleware/verifyToken';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const ocrController = new OcrController();

router.post('/', upload.single('file'), ocrController.processDocument.bind(ocrController));
router.post('/auth', verifyToken, upload.single('file'), ocrController.processDocument.bind(ocrController));

export default router;
