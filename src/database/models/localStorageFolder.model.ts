import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface ILocalStorageFolder {
    id: number;
    title: string;
    description: string;
    path: string;
    is_active: boolean;
    created_by: number;
    updated_by?: number;
}

type TLocalStorageFolder = Optional<ILocalStorageFolder, 'id'>;

export class LocalStorageFolder extends Model<ILocalStorageFolder, TLocalStorageFolder> implements ILocalStorageFolder {
    public id!: number;
    public title!: string;
    public description!: string;
    public path!: string;
    public is_active!: boolean;
    public created_by!: number;
    public updated_by?: number;

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
                    allowNull: false,
                },
                description: {
                    type: DataTypes.STRING,
                    allowNull: false,
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
                    allowNull: false,
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
