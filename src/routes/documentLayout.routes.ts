import express from 'express';
import { DocumentLayoutController } from '../controllers/documentLayout.controller';

const router = express.Router();
const documentLayoutController = new DocumentLayoutController();

router.get('/layouts', documentLayoutController.getAll.bind(documentLayoutController));

export default router;
