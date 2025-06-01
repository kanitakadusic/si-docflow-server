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

import { ProcessingRuleDestination } from './processingRuleDestination.model.js';
import { IForwarder } from '../types/model.js';
import { sendToApi } from '../services/api.service.js';

export class ExternalApiEndpoint
    extends Model<InferAttributes<ExternalApiEndpoint>, InferCreationAttributes<ExternalApiEndpoint>>
    implements IForwarder
{
    declare id: CreationOptional<number>;
    declare title: string;
    declare description: string | null;
    declare is_active: boolean;
    declare method: string;
    declare base_url: string;
    declare route: string;
    declare params: string;
    declare headers: string;
    declare timeout: number;
    declare created_by: number | null;
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
                    allowNull: false,
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                is_active: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
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
                params: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                headers: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                timeout: {
                    type: DataTypes.INTEGER,
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
        if (!this.is_active) {
            return false;
        }
        try {
            return sendToApi({
                method: this.method,
                url: this.base_url + this.route,
                params: JSON.parse(this.params),
                headers: JSON.parse(this.headers),
                data: json,
                timeout: this.timeout,
            });
        } catch (error) {
            console.error('API parse failure:', error);
            return false;
        }
    }
}
