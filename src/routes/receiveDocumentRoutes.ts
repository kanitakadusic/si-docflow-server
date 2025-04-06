// src/routes/receiveDocumentRoutes.ts
import { Router } from 'express';
import multer from 'multer';
import { receiveDocument } from '../controllers/receiveDocumentController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), receiveDocument);

export default router;
