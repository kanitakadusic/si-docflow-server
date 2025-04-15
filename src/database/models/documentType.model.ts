import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface IDocumentType {
    id: number;
    name: string;
    description: string;
    created_by: number;
}

type TDocumentType = Optional<IDocumentType, 'id'>;

export class DocumentType extends Model<IDocumentType, TDocumentType> implements IDocumentType {
    public id!: number;
    public name!: string;
    public description!: string;
    public created_by!: number;

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
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                created_by: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
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
