import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { DocumentType } from './documentType.model.js';

interface IProcessingRule {
    id: number;
    title: string;
    description: string | null;
    document_type_id: number;
    is_active: boolean;
    created_by: number;
    updated_by?: number;
}

type TProcessingRule = Optional<IProcessingRule, 'id'>;

export class ProcessingRule extends Model<IProcessingRule, TProcessingRule> implements IProcessingRule {
    public id!: number;
    public title!: string;
    public description!: string | null;
    public document_type_id!: number;
    public is_active!: boolean;
    public created_by!: number;
    public updated_by?: number;

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
                    allowNull: false,
                },
                description: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                document_type_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: DocumentType,
                        key: 'id',
                    },
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
                modelName: 'ProcessingRule',
                tableName: 'processing_rules',
            },
        );
    }
}
