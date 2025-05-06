import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';
import { ProcessingRule } from './processingRule.model.js';
import { LocalStorageFolder } from './localStorageFolder.model.js';
import { ExternalApiEndpoint } from './externalApiEndpoint.model.js';
import { ExternalFtpEndpoint } from './externalFtpEndpoint.model.js';

export class ProcessingRuleDestination extends Model<
    InferAttributes<ProcessingRuleDestination>,
    InferCreationAttributes<ProcessingRuleDestination>
> {
    declare id: CreationOptional<number>;
    declare processing_rule_id: number;
    declare local_storage_folder_id: number | null;
    declare external_api_endpoint_id: number | null;
    declare external_ftp_endpoint_id: number | null;
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
                processing_rule_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: ProcessingRule,
                        key: 'id',
                    },
                },
                local_storage_folder_id: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: LocalStorageFolder,
                        key: 'id',
                    },
                },
                external_api_endpoint_id: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: ExternalApiEndpoint,
                        key: 'id',
                    },
                },
                external_ftp_endpoint_id: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: ExternalFtpEndpoint,
                        key: 'id',
                    },
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
                modelName: 'ProcessingRuleDestination',
                tableName: 'processing_rule_destinations',
                validate: {
                    onlyOneForeignKey() {
                        const foreignKeys = [
                            this.local_storage_folder_id,
                            this.external_api_endpoint_id,
                            this.external_ftp_endpoint_id,
                        ];
                        const nonNullKeys = foreignKeys.filter((key) => key !== null);
                        if (nonNullKeys.length !== 1) {
                            throw new Error(
                                'Exactly one of local_storage_folder_id, external_api_endpoint_id, or external_ftp_endpoint_id must be non-null.',
                            );
                        }
                    },
                },
            },
        );
    }
}
