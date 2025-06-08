import express from 'express';
import multer from 'multer';

import { DocumentController } from '../controllers/document.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';
import { FileMiddleware } from '../middlewares/file.middleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const ocrController = new DocumentController();
const authMiddleware = new AuthMiddleware();
const fileMiddleware = new FileMiddleware();

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
 *               user:
 *                 type: string
 *               machineId:
 *                 type: string
 *               documentTypeId:
 *                 type: integer
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
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/ProcessResponse'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             examples:
 *               noFile:
 *                 value: { message: "Document has not been uploaded" }
 *               noMetadata:
 *                 value: { message: "Metadata (user, machine id, document type id) is missing" }
 *               noLang:
 *                 value: { message: "Language has not been specified" }
 *               noEngines:
 *                 value: { message: "Engines have not been specified" }
 *       404:
 *         description: Document related records or OCR engines not found
 *         content:
 *           application/json:
 *             examples:
 *               typeNotFound:
 *                 value: { message: "Document type (123) is not available" }
 *               layoutNotFound:
 *                 value: { message: "Document layout for document type (123) is not available" }
 *               imageNotFound:
 *                 value: { message: "Layout image for document type (123) is not available" }
 *               enginesNotFound:
 *                 value: { message: "Provided OCR engines are not supported" }
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               message: Server error while processing document
 */
router.post(
    '/process',
    upload.single('file'),
    fileMiddleware.resizeImage.bind(fileMiddleware),
    ocrController.process.bind(ocrController),
);
router.post(
    '/process/auth',
    authMiddleware.verifyToken.bind(authMiddleware),
    upload.single('file'),
    fileMiddleware.resizeImage.bind(fileMiddleware),
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
 *             $ref: '#/components/schemas/ProcessResponse'
 *     responses:
 *       200:
 *         description: Document has been successfully finalized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/FinalizeResponse'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid or missing request body
 *         content:
 *           application/json:
 *             examples:
 *               invalidFormat:
 *                 value: { message: "Invalid finalization data format" }
 *       500:
 *         description: Server error
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

/**
 * @swagger
 * components:
 *   schemas:
 *     Field:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         upper_left:
 *           type: array
 *           items:
 *             type: number
 *         lower_right:
 *           type: array
 *           items:
 *             type: number
 *         is_multiline:
 *           type: boolean

 *     OcrResult:
 *       type: object
 *       properties:
 *         text:
 *           type: string
 *         confidence:
 *           type: number
 *         price:
 *           type: number

 *     MappedOcrResult:
 *       type: object
 *       properties:
 *         field:
 *           $ref: '#/components/schemas/Field'
 *         result:
 *           $ref: '#/components/schemas/OcrResult'

 *     ProcessResult:
 *       type: object
 *       required:
 *         - engine
 *         - ocr
 *         - triplet_ids
 *       properties:
 *         engine:
 *           type: string
 *         ocr:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MappedOcrResult'
 *         triplet_ids:
 *           type: array
 *           items:
 *             type: integer

 *     ProcessResponse:
 *       type: object
 *       properties:
 *         document_type_id:
 *           type: integer
 *         process_results:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProcessResult'
 *       example:
 *         document_type_id: 1
 *         process_results:
 *           - engine: "googleVision"
 *             ocr:
 *               - field:
 *                   name: "Address"
 *                   upper_left: [133.41, 155.22]
 *                   lower_right: [374.41, 176.22]
 *                   is_multiline: false
 *                 result:
 *                   text: "789 Oak Road"
 *                   confidence: 0.97
 *                   price: 0.00015
 *             triplet_ids: [1]

 *     FinalizeResponse:
 *       type: object
 *       properties:
 *         storages:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               is_sent:
 *                 type: boolean
 *         apis:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               is_sent:
 *                 type: boolean
 *         ftps:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               is_sent:
 *                 type: boolean
 *         is_logged:
 *           type: boolean
 */
