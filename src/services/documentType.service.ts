import { DocumentType } from '../database/models/documentType.model';

export class DocumentTypeService {
    async getAll(): Promise<DocumentType[]> {
        return await DocumentType.findAll();
    }

    async getById(id: number): Promise<DocumentType | null> {
        return await DocumentType.findByPk(id);
    }

    async getByName(name: string): Promise<DocumentType | null> {
        return await DocumentType.findOne({ where: { name } });
    }
}
