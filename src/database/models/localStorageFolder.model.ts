import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export class LocalStorageFolder extends Model<
    InferAttributes<LocalStorageFolder>,
    InferCreationAttributes<LocalStorageFolder>
> {
    declare id: CreationOptional<number>;
    declare title: string | null;
    declare description: string | null;
    declare path: string;
    declare is_active: boolean;
    declare created_by?: number | null;
    declare updated_by?: number | null;

    public static initialize(sequelize: Sequelize) {
        this.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                title: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                description: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                path: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                is_active: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
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
                modelName: 'LocalStorageFolder',
                tableName: 'local_storage_folders',
            },
        );
    }
}
