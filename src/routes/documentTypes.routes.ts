import express from 'express';
import { getDocumentTypes } from '../controllers/documentTypes.controllers';

const ROUTER = express.Router();

ROUTER.get('/types', getDocumentTypes);

export default ROUTER;
