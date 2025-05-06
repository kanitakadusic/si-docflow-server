import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';
import { DocumentType } from './documentType.model.js';

export class ProcessingRule extends Model<InferAttributes<ProcessingRule>, InferCreationAttributes<ProcessingRule>> {
    declare id: CreationOptional<number>;
    declare title: string;
    declare description: string | null;
    declare document_type_id: number;
    declare is_active: boolean;
    declare created_by: number | null;
    declare updated_by: number | null;

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
                    allowNull: true,
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
