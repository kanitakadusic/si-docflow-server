import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface IField {
    name: string;
    upper_left: [number, number];
    lower_right: [number, number];
    is_multiline: boolean;
}

interface IDocumentLayout {
    id: number;
    name: string;
    fields: string;
    image_id: number;
    created_by?: number;
    updated_by?: number;
}

type TDocumentLayout = Optional<IDocumentLayout, 'id'>;

export class DocumentLayout extends Model<IDocumentLayout, TDocumentLayout> implements IDocumentLayout {
    public id!: number;
    public name!: string;
    public fields!: string;
    public image_id!: number;
    public created_by?: number;
    public updated_by?: number;

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
                    get(): IField[] {
                        const value = this.getDataValue('fields');
                        return value ? JSON.parse(value) : [];
                    },
                    set(value: IField[]): void {
                        this.setDataValue('fields', JSON.stringify(value));
                    },
                },
                image_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    unique: true,
                },
                created_by: {
                    type: DataTypes.INTEGER,
                },
                updated_by: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
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
