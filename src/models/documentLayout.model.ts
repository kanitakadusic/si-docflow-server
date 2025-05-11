import {
    Association,
    CreationOptional,
    DataTypes,
    DestroyOptions,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
    Sequelize,
} from 'sequelize';
import { DocumentType } from './documentType.model.js';
import { LayoutImage } from './layoutImage.model.js';
import { IField } from '../types/model.js';

export class DocumentLayout extends Model<InferAttributes<DocumentLayout>, InferCreationAttributes<DocumentLayout>> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare fields: string;
    declare image_id: ForeignKey<LayoutImage['id']>;
    declare created_by: number;
    declare updated_by: number | null;

    declare documentType?: NonAttribute<DocumentType>;
    declare layoutImage?: NonAttribute<LayoutImage>;

    declare static associations: {
        documentType: Association<DocumentLayout, DocumentType>;
        layoutImage: Association<DocumentLayout, LayoutImage>;
    };

    public getFields(): IField[] {
        const value = this.getDataValue('fields');
        return value ? JSON.parse(value) : [];
    }
    public setFields(value: IField[]) {
        this.setDataValue('fields', JSON.stringify(value));
    }

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
                    allowNull: false,
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

    public static associate() {
        this.hasOne(DocumentType, {
            foreignKey: 'document_layout_id',
            as: 'documentType',
        });

        this.belongsTo(LayoutImage, {
            foreignKey: 'image_id',
            as: 'layoutImage',
        });
    }

    public static hook() {
        this.addHook('afterDestroy', async (layout: DocumentLayout, options: DestroyOptions) => {
            const imageId: number | undefined = layout.image_id;
            if (imageId) {
                await LayoutImage.destroy({
                    where: { id: imageId },
                    transaction: options.transaction,
                });
            }
        });
    }
}
