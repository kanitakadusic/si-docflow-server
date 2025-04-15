import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface IAccessRight {
    id: number;
    token: string;
    is_active: boolean;
    name: string;
    description: string;
    created_by: number;
}

type TAccessRight = Optional<IAccessRight, 'id'>;

export class AccessRight extends Model<IAccessRight, TAccessRight> implements IAccessRight {
    public id!: number;
    public token!: string;
    public is_active!: boolean;
    public name!: string;
    public description!: string;
    public created_by!: number;

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
                    allowNull: false,
                },
                created_by: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
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
