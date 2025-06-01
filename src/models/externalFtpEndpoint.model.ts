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
import { uploadToFtp } from '../services/ftp.service.js';

export class ExternalFtpEndpoint
    extends Model<InferAttributes<ExternalFtpEndpoint>, InferCreationAttributes<ExternalFtpEndpoint>>
    implements IForwarder
{
    declare id: CreationOptional<number>;
    declare title: string;
    declare description: string | null;
    declare is_active: boolean;
    declare host: string;
    declare port: number;
    declare username: string;
    declare password: string;
    declare secure: boolean;
    declare path: string;
    declare created_by: number | null;
    declare updated_by: number | null;

    declare processingRuleDestinations?: NonAttribute<ProcessingRuleDestination[]>;

    declare static associations: {
        processingRuleDestinations: Association<ExternalFtpEndpoint, ProcessingRuleDestination>;
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

    public static associate() {
        ExternalFtpEndpoint.hasMany(ProcessingRuleDestination, {
            foreignKey: 'external_ftp_endpoint_id',
            as: 'processingRuleDestinations',
        });
    }

    public static hook() {}

    async send(json: object): Promise<boolean> {
        if (!this.is_active) {
            return false;
        }
        try {
            return uploadToFtp({
                host: this.host,
                port: this.port,
                user: this.username,
                password: this.password,
                secure: this.secure,
                path: this.path,
                content: JSON.stringify(json, null, 2),
            });
        } catch (error) {
            console.error('FTP stringify failure:', error);
            return false;
        }
    }
}
