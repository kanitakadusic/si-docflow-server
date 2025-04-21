import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface IAccessRight {
    id: number;
    name: string;
    token: string;
    is_active: boolean;
    description?: string;
    created_by?: number;
    updated_by?: number;
}

type TAccessRight = Optional<IAccessRight, 'id'>;

export class AccessRight extends Model<IAccessRight, TAccessRight> implements IAccessRight {
    declare id: number;
    declare name: string;
    declare token: string;
    declare is_active: boolean;
    declare description?: string;
    declare created_by?: number;
    declare updated_by?: number;

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
                    unique: true,
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
            },
            {
                sequelize,
                modelName: 'AccessRight',
                tableName: 'access_rights',
            },
        );
    }
}
