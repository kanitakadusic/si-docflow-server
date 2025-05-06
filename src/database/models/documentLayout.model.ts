import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export interface IField {
    name: string;
    upper_left: [number, number];
    lower_right: [number, number];
    is_multiline: boolean;
}

export class DocumentLayout extends Model<InferAttributes<DocumentLayout>, InferCreationAttributes<DocumentLayout>> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare fields: string;
    declare image_id: number;
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
                    allowNull: true,
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
