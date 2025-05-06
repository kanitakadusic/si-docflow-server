import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface IDocumentType {
    id: number;
    name: string;
    description?: string;
    document_layout_id?: number;
    created_by?: number;
}

type TDocumentType = Optional<IDocumentType, 'id'>;

export class DocumentType extends Model<IDocumentType, TDocumentType> implements IDocumentType {
    public id!: number;
    public name!: string;
    public description?: string;
    public document_layout_id?: number;
    public created_by?: number;

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
