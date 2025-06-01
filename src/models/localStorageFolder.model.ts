import {
    Association,
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
    Sequelize,
} from 'sequelize';

import { STORAGE_LOCATION } from '../config/env.js';

import { ProcessingRuleDestination } from './processingRuleDestination.model.js';
import { IForwarder } from '../types/model.js';
import { saveToFilesystem } from '../services/storages/filesystem.service.js';
import { saveToSupabase } from '../services/storages/supabase.service.js';

export class LocalStorageFolder
    extends Model<InferAttributes<LocalStorageFolder>, InferCreationAttributes<LocalStorageFolder>>
    implements IForwarder
{
    declare id: CreationOptional<number>;
    declare title: string;
    declare description: string | null;
    declare is_active: boolean;
    declare path: string;
    declare created_by: number | null;
    declare updated_by: number | null;

    declare processingRuleDestinations?: NonAttribute<ProcessingRuleDestination[]>;

    declare static associations: {
        processingRuleDestinations: Association<LocalStorageFolder, ProcessingRuleDestination>;
    };

    public static initialize(sequelize: Sequelize) {
        this.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                title: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                is_active: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
                },
                path: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                created_by: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                updated_by: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
            },
            {
                sequelize,
                modelName: 'LocalStorageFolder',
                tableName: 'local_storage_folders',
            },
        );
    }

    public static associate() {
        this.hasMany(ProcessingRuleDestination, {
            foreignKey: 'local_storage_folder_id',
            as: 'processingRuleDestinations',
        });
    }

    public static hook() {}

    async send(json: object): Promise<boolean> {
        if (!this.is_active) {
            return false;
        }
        try {
            const location = (STORAGE_LOCATION || '').toLowerCase();
            const data = JSON.stringify(json, null, 2);

            if (location === 'filesystem') {
                return saveToFilesystem(data, this.path);
            } else if (location === 'supabase') {
                return saveToSupabase(data, this.path);
            }

            console.error(`Unsupported storage location: ${STORAGE_LOCATION}`);
            return false;
        } catch (error) {
            console.error('Storage stringify failure:', error);
            return false;
        }
    }
}
