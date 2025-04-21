import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface IDocumentType {
    id: number;
    name: string;
    description?: string;
    created_by?: number;
}

type TDocumentType = Optional<IDocumentType, 'id'>;

export class DocumentType extends Model<IDocumentType, TDocumentType> implements IDocumentType {
    declare id: number;
    declare name: string;
    declare description?: string;
    declare created_by?: number;

    public static initialize(sequelize: Sequelize) {
        this.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
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
