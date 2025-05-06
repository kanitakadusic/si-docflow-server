import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface IExternalFtpEndpoint {
    id: number;
    title?: string;
    description?: string;
    host: string;
    port: number;
    username: string;
    password: string;
    secure: boolean;
    path: string;
    created_by: number;
    updated_by?: number;
}

type TExternalFtpEndpoint = Optional<IExternalFtpEndpoint, 'id'>;

export class ExternalFtpEndpoint
    extends Model<IExternalFtpEndpoint, TExternalFtpEndpoint>
    implements IExternalFtpEndpoint
{
    public id!: number;
    public title?: string;
    public description?: string;
    public host!: string;
    public port!: number;
    public username!: string;
    public password!: string;
    public secure!: boolean;
    public path!: string;
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
                    allowNull: false,
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
