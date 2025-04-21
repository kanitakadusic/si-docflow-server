import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface ILayoutImage {
    id: number;
    image: Buffer;
    width: number;
    height: number;
}

type TLayoutImage = Optional<ILayoutImage, 'id'>;

export class LayoutImage extends Model<ILayoutImage, TLayoutImage> implements ILayoutImage {
    declare id: number;
    declare image: Buffer;
    declare width: number;
    declare height: number;

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
}
