import { AccessRight } from '../database/models/accessRight.model.js';

export class AccessRightService {
    async getAll(): Promise<AccessRight[]> {
        return await AccessRight.findAll();
    }

    async getAllActive(): Promise<AccessRight[]> {
        return await AccessRight.findAll({ where: { is_active: true } });
    }

    async getById(id: number): Promise<AccessRight | null> {
        return await AccessRight.findByPk(id);
    }

    async getByName(name: string): Promise<AccessRight | null> {
        return await AccessRight.findOne({ where: { name } });
    }
}
