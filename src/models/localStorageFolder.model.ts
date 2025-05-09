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

import { ProcessingRuleDestination } from './processingRuleDestination.model.js';
import { IForwarder } from '../types/model.js';
import { supabase } from '../config/supabaseClient.js';

export class LocalStorageFolder
    extends Model<InferAttributes<LocalStorageFolder>, InferCreationAttributes<LocalStorageFolder>>
    implements IForwarder
{
    declare id: CreationOptional<number>;
    declare title: string | null;
    declare description: string | null;
    declare path: string;
    declare is_active: boolean;
    declare created_by: number;
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
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                description: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                path: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                is_active: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
                },
                created_by: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
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

    async send(json: object) {
        try {
            const buffer = Buffer.from(JSON.stringify(json, null, 2), 'utf-8');
            const filename = `${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
            const fullPath = `${this.path}/${filename}`;

            const { error } = await supabase.storage.from('finalized-documents').upload(fullPath, buffer, {
                contentType: 'application/json',
            });

            if (error) {
                console.error('Local storage folder failure:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Local storage folder failure:', error);
            return false;
        }
    }
}
