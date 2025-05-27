import express from 'express';
import multer from 'multer';

import { DocumentController } from '../controllers/document.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const ocrController = new DocumentController();
const authMiddleware = new AuthMiddleware();

/**
 * @swagger
 * /document/process:
 *   post:
 *     summary: Process a document with OCR engines
 *     tags:
 *       - OCR
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: "Supported extensions: .jpg .jpeg .png .pdf"
 *               user:
 *                 type: string
 *                 description: User submitting the document
 *               machineId:
 *                 type: string
 *                 description: IP address/port (e.g. 192.168.1.10/8080)
 *               documentTypeId:
 *                 type: integer
 *                 description: ID of the document type
 *             required:
 *               - file
 *               - user
 *               - machineId
 *               - documentTypeId
 *     parameters:
 *       - in: query
 *         name: lang
 *         schema:
 *           type: string
 *         required: true
 *         description: Language code for OCR (e.g. bos, eng)
 *       - in: query
 *         name: engines
 *         schema:
 *           type: string
 *         required: true
 *         description: Comma-separated OCR engines (e.g. tesseract, googleVision, chatGpt)
 *     responses:
 *       200:
 *         description: Document has been successfully processed
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 - engine: googleVision
 *                   ocr:
 *                     - field:
 *                         name: "Address"
 *                         upper_left: [133.41, 155.22]
 *                         lower_right: [374.41, 176.22]
 *                         is_multiline: false
 *                       result:
 *                         text: "789 Oak Road"
 *                         confidence: 0.97
 *                         price: 0.00015
 *                   tripletIds: [133]
 *               message: Document has been successfully processed
 *       400:
 *         description: Bad request due to missing file or metadata
 *         content:
 *           application/json:
 *             examples:
 *               noFile:
 *                 summary: No file uploaded
 *                 value:
 *                   message: Document has not been uploaded
 *               missingMetadata:
 *                 summary: Missing required metadata
 *                 value:
 *                   message: Metadata (user, machine id, document type id) is missing
 *               noLang:
 *                 summary: Language query missing
 *                 value:
 *                   message: Language has not been specified
 *               noEngines:
 *                 summary: Engines query missing
 *                 value:
 *                   message: Engines have not been specified
 *       404:
 *         description: Document type or layout not found
 *         content:
 *           application/json:
 *             examples:
 *               typeNotFound:
 *                 summary: Document type not found
 *                 value:
 *                   message: Document type (123) is not available
 *               layoutNotFound:
 *                 summary: Document layout not found
 *                 value:
 *                   message: Document layout for document type (123) is not available
 *               imageNotFound:
 *                 summary: Layout image not found
 *                 value:
 *                   message: Layout image for document type (123) is not available
 *       500:
 *         description: Server error while processing document
 *         content:
 *           application/json:
 *             example:
 *               message: Server error while processing document
 */
router.post('/process', upload.single('file'), ocrController.process.bind(ocrController));
router.post(
    '/process/auth',
    authMiddleware.verifyToken.bind(authMiddleware),
    upload.single('file'),
    ocrController.process.bind(ocrController),
);

/**
 * @swagger
 * /document/finalize:
 *   post:
 *     summary: Finalize document processed with OCR
 *     tags:
 *       - OCR
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               document_type_id:
 *                 type: integer
 *                 description: ID of the document type
 *               engine:
 *                 type: string
 *                 description: View POST /document/process
 *               ocr:
 *                 type: array
 *                 items:
 *                   type: object
 *                   description: View POST /document/process
 *               tripletIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: View POST /document/process
 *             required:
 *               - document_type_id
 *               - engine
 *               - ocr
 *               - tripletIds
 *     responses:
 *       200:
 *         description: Document has been successfully finalized
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 storages:
 *                   - id: 1
 *                     is_sent: true
 *                 apis:
 *                   - id: 1
 *                     is_sent: true
 *                 ftps:
 *                   - id: 1
 *                     is_sent: false
 *               message: Document has been successfully finalized
 *       400:
 *         description: Missing or invalid data in request
 *         content:
 *           application/json:
 *             examples:
 *               missingData:
 *                 summary: Missing document_type_id
 *                 value:
 *                   message: Document type has not been specified
 *               missingBody:
 *                 summary: Empty body
 *                 value:
 *                   message: Data for finalization is missing
 *       500:
 *         description: Server error during finalization
 *         content:
 *           application/json:
 *             example:
 *               message: Server error while finalizing document
 */
router.post('/finalize', ocrController.finalize.bind(ocrController));
router.post(
    '/finalize/auth',
    authMiddleware.verifyToken.bind(authMiddleware),
    ocrController.finalize.bind(ocrController),
);

export default router;
