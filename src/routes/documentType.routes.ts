import express from 'express';
import { DocumentTypeController } from '../controllers/documentType.controller';

const router = express.Router();
const documentTypeController = new DocumentTypeController();

router.get('/types', documentTypeController.getAll.bind(documentTypeController));

export default router;
