import express from 'express';
import multer from 'multer';
import { postDocumentWithMetadata } from '../controllers/document.controllers';
import { verifyToken } from '../middleware/verifyToken'; 

const ROUTER = express.Router();

const UPLOAD = multer({ storage: multer.memoryStorage() });
ROUTER.post('/', UPLOAD.single('file'), postDocumentWithMetadata);
ROUTER.post('/auth', verifyToken, UPLOAD.single('file'), postDocumentWithMetadata);

export default ROUTER;
