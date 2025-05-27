import express from 'express';

import { DocumentLayoutController } from '../controllers/documentLayout.controller.js';

const router = express.Router();
const documentLayoutController = new DocumentLayoutController();

/**
 * @swagger
 * /document/layouts:
 *   get:
 *     summary: Fetch all document layouts
 *     tags:
 *       - Document Layout
 *     responses:
 *       200:
 *         description: Document layouts have been successfully fetched
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 - id: 1
 *                   name: "Employment Verification Form"
 *                   image_id: 1
 *                   fields:
 *                     - name: "Address"
 *                       upper_left: [133.41, 155.22]
 *                       lower_right: [374.41, 176.22]
 *                       is_multiline: false
 *               message: Document layouts have been successfully fetched
 *       500:
 *         description: Server error while fetching document layouts
 *         content:
 *           application/json:
 *             example:
 *               message: Server error while fetching document layouts
 */
router.get('/layouts', documentLayoutController.getAll.bind(documentLayoutController));

export default router;
