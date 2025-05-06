import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export class ExternalFtpEndpoint extends Model<
    InferAttributes<ExternalFtpEndpoint>,
    InferCreationAttributes<ExternalFtpEndpoint>
> {
    declare id: CreationOptional<number>;
    declare title: string | null;
    declare description: string | null;
    declare host: string;
    declare port: number;
    declare username: string;
    declare password: string;
    declare secure: boolean;
    declare path: string;
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
                title: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                host: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                port: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 21,
                },
                username: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                    defaultValue: 'anonymous',
                },
                password: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                    defaultValue: 'guest',
                },
                secure: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false,
                },
                path: {
                    type: DataTypes.TEXT,
                    allowNull: false,
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
                modelName: 'ExternalFtpEndpoint',
                tableName: 'external_ftp_endpoints',
            },
        );
    }
}
