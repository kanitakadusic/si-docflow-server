import {
    Association,
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
    Sequelize,
} from 'sequelize';

import { DocumentLayout } from './documentLayout.model.js';

export class LayoutImage extends Model<InferAttributes<LayoutImage>, InferCreationAttributes<LayoutImage>> {
    declare id: CreationOptional<number>;
    declare image: Buffer;
    declare width: number;
    declare height: number;

    declare documentLayout?: NonAttribute<DocumentLayout>;

    declare static associations: {
        documentLayout: Association<LayoutImage, DocumentLayout>;
    };

    public static initialize(sequelize: Sequelize) {
        this.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                image: {
                    type: DataTypes.BLOB('medium'),
                    allowNull: false,
                },
                width: {
                    type: DataTypes.DOUBLE,
                    allowNull: false,
                },
                height: {
                    type: DataTypes.DOUBLE,
                    allowNull: false,
                },
            },
            {
                sequelize,
                modelName: 'LayoutImage',
                tableName: 'layout_images',
            },
        );
    }

    public static associate() {
        this.hasOne(DocumentLayout, {
            foreignKey: 'image_id',
            as: 'documentLayout',
        });
    }

    public static hook() {}
}
