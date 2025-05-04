import { LayoutImage } from '../database/models/layoutImage.model.js';

export class LayoutImageService {
    async getAll(): Promise<LayoutImage[]> {
        return await LayoutImage.findAll();
    }

    async getById(id: number): Promise<LayoutImage | null> {
        return await LayoutImage.findByPk(id);
    }
}
