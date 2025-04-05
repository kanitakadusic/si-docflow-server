// src/controllers/receiveDocumentController.ts
import { Request, Response } from 'express';

interface MetadataRequest extends Request {
  file?: Express.Multer.File;
  body: {
    user: string;
    pc: string;
    type: string;
  };
}

export const receiveDocument = (req: MetadataRequest, res: Response): void => {
  const { user, pc, type } = req.body;

  if (!req.file) {
    res.status(400).json({ message: 'Fajl nije poslan.' });
    return;
  }

  console.log('Primljen fajl:', req.file.originalname);
  console.log('Metadata:', { user, pc, type });

  res.status(200).json({
    message: 'Dokument i metapodaci uspješno primljeni.',
    filename: req.file.originalname,
    metadata: { user, pc, type },
  });
};
