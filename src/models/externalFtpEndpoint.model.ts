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
import { Client } from 'basic-ftp';
import { Readable } from 'stream';

import { ProcessingRuleDestination } from './processingRuleDestination.model.js';
import { IForwarder } from '../types/model.js';

export class ExternalFtpEndpoint
    extends Model<InferAttributes<ExternalFtpEndpoint>, InferCreationAttributes<ExternalFtpEndpoint>>
    implements IForwarder
{
    declare id: CreationOptional<number>;
    declare title: string | null;
    declare description: string | null;
    declare host: string;
    declare port: number;
    declare username: string;
    declare password: string;
    declare secure: boolean;
    declare path: string;
    declare created_by: number;
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

    public static associate() {
        ExternalFtpEndpoint.hasMany(ProcessingRuleDestination, {
            foreignKey: 'external_ftp_endpoint_id',
            as: 'processingRuleDestinations',
        });
    }

    public static hook() {}

    async send(json: object): Promise<boolean> {
        const client = new Client();
        try {
            await client.access({
                host: this.host,
                port: this.port,
                user: this.username,
                password: this.password,
                secure: this.secure,
            });

            const stream = Readable.from(Buffer.from(JSON.stringify(json, null, 2), 'utf-8'));
            const filename = `${new Date().toISOString().replace(/[:.]/g, '-')}.json`;

            await client.ensureDir(this.path);
            await client.uploadFrom(stream, filename);
            return true;
        } catch (error) {
            console.error('External FTP endpoint failure:', error);
            return false;
        } finally {
            client.close();
        }
    }
}
