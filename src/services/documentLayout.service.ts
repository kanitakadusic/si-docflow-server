import { DocumentLayout } from '../database/db.js';

export class DocumentLayoutService {
    async getAll(): Promise<DocumentLayout[]> {
        return await DocumentLayout.findAll();
    }

    async getAllByDocumentTypeId(name: string): Promise<DocumentLayout[]> {
        return await DocumentLayout.findAll({ where: {name: name } }); /// pisalo document_type: id
    }

    async getById(id: number): Promise<DocumentLayout | null> {
        return await DocumentLayout.findByPk(id);
    }

    async getByName(name: string): Promise<DocumentLayout | null> {
        return await DocumentLayout.findOne({ where: { name } });
    }
}
