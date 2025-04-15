import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface IDocumentLayout {
    id: number;
    name: string;
    fields: string;
    document_type: number;
    image_id: number;
    created_by: number;
}

type TDocumentLayout = Optional<IDocumentLayout, 'id'>;

export class DocumentLayout
    extends Model<IDocumentLayout, TDocumentLayout>
    implements IDocumentLayout
{
    public id!: number;
    public name!: string;
    public fields!: string;
    public document_type!: number;
    public image_id!: number;
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
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                fields: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                document_type: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                image_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    unique: true,
                },
                created_by: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
            },
            {
                sequelize,
                modelName: 'DocumentLayout',
                tableName: 'document_layouts',
            },
        );
    }
}
