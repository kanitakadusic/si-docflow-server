import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export class AccessRight extends Model<InferAttributes<AccessRight>, InferCreationAttributes<AccessRight>> {
    declare id: CreationOptional<number>;
    declare token: string;
    declare is_active: boolean;
    declare name: string;
    declare description: string | null;
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
                token: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                    unique: true,
                },
                is_active: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                },
                name: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: true,
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
                modelName: 'AccessRight',
                tableName: 'access_rights',
            },
        );
    }
}
