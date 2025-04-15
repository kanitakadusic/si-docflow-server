import express from 'express';
import { getDocumentLayouts } from '../controllers/documentLayout.controllers';

const ROUTER = express.Router();

ROUTER.get('/layouts', getDocumentLayouts);

export default ROUTER;
