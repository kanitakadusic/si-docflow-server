import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export class DocumentType extends Model<InferAttributes<DocumentType>, InferCreationAttributes<DocumentType>> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare description: string | null;
    declare document_layout_id: number | null;
    declare created_by: number | null;

    public static initialize(sequelize: Sequelize) {
        this.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                name: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                    unique: true,
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                document_layout_id: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    unique: true,
                },
                created_by: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
            },
            {
                sequelize,
                modelName: 'DocumentType',
                tableName: 'document_types',
            },
        );
    }
}
