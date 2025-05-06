import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

const authTypes = ['Basic', 'Bearer', 'API_Key', 'OAuth', 'None'] as const;
type AuthType = (typeof authTypes)[number];

interface IExternalApiEndpoint {
    id: number;
    title?: string;
    description?: string;
    is_active: boolean;
    auth_type?: AuthType;
    auth_credentials?: string;
    method: string;
    base_url: string;
    route: string;
    query_parameters?: string;
    headers: string;
    body?: string;
    timeout_seconds: number;
    created_by: number;
    updated_by?: number;
}

type TExternalApiEndpoint = Optional<IExternalApiEndpoint, 'id'>;

export class ExternalApiEndpoint
    extends Model<IExternalApiEndpoint, TExternalApiEndpoint>
    implements IExternalApiEndpoint
{
    public id!: number;
    public title?: string;
    public description?: string;
    public is_active!: boolean;
    public auth_type?: AuthType;
    public auth_credentials?: string;
    public method!: string;
    public base_url!: string;
    public route!: string;
    public query_parameters?: string;
    public headers!: string;
    public body?: string;
    public timeout_seconds!: number;
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
                is_active: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                },
                auth_type: {
                    type: DataTypes.ENUM(...authTypes),
                    allowNull: true,
                },
                auth_credentials: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                method: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                base_url: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                route: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                query_parameters: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                headers: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                body: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                timeout_seconds: {
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
                modelName: 'ExternalApiEndpoint',
                tableName: 'external_api_endpoints',
            },
        );
    }
}
