import express from 'express';
import multer from 'multer';
import { postDocumentWithMetadata } from '../controllers/document.controllers';

const ROUTER = express.Router();

const UPLOAD = multer({ storage: multer.memoryStorage() });
ROUTER.post('/', UPLOAD.single('file'), postDocumentWithMetadata);

export default ROUTER;
