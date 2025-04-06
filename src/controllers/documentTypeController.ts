import { Request, Response } from "express";
import db from '../database/db'


const getAllDocumentTypes = async (req: Request, res: Response) => {
    const docTypes = await db.documentType.findAll({
        attributes: ['id', 'name', 'description']
    });
    res.json(docTypes);
};

module.exports = {
    getAllDocumentTypes,
};
