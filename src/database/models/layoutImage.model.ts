import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export class LayoutImage extends Model<InferAttributes<LayoutImage>, InferCreationAttributes<LayoutImage>> {
    declare id: CreationOptional<number>;
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
