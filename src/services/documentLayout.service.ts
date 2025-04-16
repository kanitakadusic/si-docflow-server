import { DocumentLayout } from '../database/db';

// development
import path from 'path';
import fs from 'fs';

async function readFile(): Promise<DocumentLayout[]> {
    try {
        const filePath = path.join(__dirname, 'document_layouts.json');
        const rawData = await fs.promises.readFile(filePath, 'utf-8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Error reading JSON file:', error);
        throw error;
    }
}
// -----

export class DocumentLayoutService {
    // development
    async getAllTest(): Promise<DocumentLayout[]> {
        return await readFile();
    }
    // -----

    async getAll(): Promise<DocumentLayout[]> {
        return await DocumentLayout.findAll();
    }

    async getById(id: number): Promise<DocumentLayout | null> {
        return await DocumentLayout.findByPk(id);
    }

    async getByName(name: string): Promise<DocumentLayout | null> {
        return await DocumentLayout.findOne({ where: { name } });
    }
}
