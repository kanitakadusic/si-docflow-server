import express from 'express';

import { DocumentTypeController } from '../controllers/documentType.controller.js';

const router = express.Router();
const documentTypeController = new DocumentTypeController();

/**
 * @swagger
 * /document/types:
 *   get:
 *     summary: Fetch all document types
 *     tags:
 *       - Document Type
 *     responses:
 *       200:
 *         description: Document types have been successfully fetched
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 - id: 1
 *                   name: "Employment Verification Form"
 *                   description: "Confirms a person's job status and details."
 *                   document_layout_id: 1
 *               message: Document types have been successfully fetched
 *       500:
 *         description: Server error while fetching document types
 *         content:
 *           application/json:
 *             example:
 *               message: Server error while fetching document types
 */
router.get('/types', documentTypeController.getAll.bind(documentTypeController));

export default router;
