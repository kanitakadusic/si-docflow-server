import express from 'express';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const userController = require('../controllers/documentTypeController.ts');

const router = express.Router();

router.get('/', userController.getAllDocumentTypes);

export default router;

module.exports = router;