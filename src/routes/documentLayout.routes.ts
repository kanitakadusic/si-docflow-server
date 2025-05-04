import express from 'express';

import { DocumentLayoutController } from '../controllers/documentLayout.controller.js';

const router = express.Router();
const documentLayoutController = new DocumentLayoutController();

router.get('/layouts', documentLayoutController.getAll.bind(documentLayoutController));

export default router;
