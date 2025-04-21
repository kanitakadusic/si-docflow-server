import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface IField {
    name: string;
    upper_left: [number, number];
    lower_right: [number, number];
}

interface IDocumentLayout {
    id: number;
    name: string;
    fields: string;
    document_type: number;
    image_id: number;
    created_by?: number;
}

type TDocumentLayout = Optional<IDocumentLayout, 'id'>;

export class DocumentLayout extends Model<IDocumentLayout, TDocumentLayout> implements IDocumentLayout {
    declare id: number;
    declare name: string;
    declare fields: string;
    declare document_type: number;
    declare image_id: number;
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
                    type: DataTypes.TEXT,
                    allowNull: false,
                    unique: true,
                },
                fields: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                    get(): IField[] {
                        const value = this.getDataValue('fields');
                        return value ? JSON.parse(value) : [];
                    },
                    set(value: IField[]): void {
                        this.setDataValue('fields', JSON.stringify(value));
                    },
                },
                document_type: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    unique: true,
                },
                image_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    unique: true,
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
