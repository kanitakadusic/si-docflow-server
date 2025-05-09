import {
    Association,
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
    Sequelize,
} from 'sequelize';
import axios from 'axios';

import { ProcessingRuleDestination } from './processingRuleDestination.model.js';
import { IForwarder } from '../types/model.js';

const authTypes = ['Basic', 'Bearer', 'API_Key', 'OAuth', 'None'] as const;
type AuthType = (typeof authTypes)[number];

export class ExternalApiEndpoint
    extends Model<InferAttributes<ExternalApiEndpoint>, InferCreationAttributes<ExternalApiEndpoint>>
    implements IForwarder
{
    declare id: CreationOptional<number>;
    declare title: string | null;
    declare description: string | null;
    declare is_active: boolean;
    declare auth_type: AuthType | null;
    declare auth_credentials: string | null;
    declare method: string;
    declare base_url: string;
    declare route: string;
    declare query_parameters: string | null;
    declare headers: string;
    declare body: string | null;
    declare timeout_seconds: number;
    declare created_by: number;
    declare updated_by: number | null;

    declare processingRuleDestinations?: NonAttribute<ProcessingRuleDestination[]>;

    declare static associations: {
        processingRuleDestinations: Association<ExternalApiEndpoint, ProcessingRuleDestination>;
    };

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

    public static associate() {
        this.hasMany(ProcessingRuleDestination, {
            foreignKey: 'external_api_endpoint_id',
            as: 'processingRuleDestinations',
        });
    }

    public static hook() {}

    async send(json: object): Promise<boolean> {
        try {
            const headers = this.headers ? JSON.parse(this.headers) : {};
            if (!this.is_active || this.method !== 'POST' || headers['Content-Type'] !== 'application/json') {
                return false;
            }
            const response = await axios.post(
                this.base_url + this.route,
                {
                    metadata: this.body ? JSON.parse(this.body) : {},
                    document: json,
                },
                {
                    headers,
                    params: this.query_parameters ? JSON.parse(this.query_parameters) : {},
                    timeout: this.timeout_seconds * 1000,
                },
            );
            return response.status === 200;
        } catch (error) {
            console.error('External API endpoint failure:', error);
            return false;
        }
    }
}
