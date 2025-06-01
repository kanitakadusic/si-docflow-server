import {
    Association,
    CreationOptional,
    DataTypes,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
    Sequelize,
} from 'sequelize';

import { ProcessingRule } from './processingRule.model.js';
import { LocalStorageFolder } from './localStorageFolder.model.js';
import { ExternalApiEndpoint } from './externalApiEndpoint.model.js';
import { ExternalFtpEndpoint } from './externalFtpEndpoint.model.js';

export class ProcessingRuleDestination extends Model<
    InferAttributes<ProcessingRuleDestination>,
    InferCreationAttributes<ProcessingRuleDestination>
> {
    declare id: CreationOptional<number>;
    declare processing_rule_id: ForeignKey<ProcessingRule['id']>;
    declare local_storage_folder_id: ForeignKey<LocalStorageFolder['id']>;
    declare external_api_endpoint_id: ForeignKey<ExternalApiEndpoint['id']>;
    declare external_ftp_endpoint_id: ForeignKey<ExternalFtpEndpoint['id']>;
    declare created_by: number | null;
    declare updated_by: number | null;

    declare processingRule?: NonAttribute<ProcessingRule>;
    declare localStorageFolder?: NonAttribute<LocalStorageFolder>;
    declare externalApiEndpoint?: NonAttribute<ExternalApiEndpoint>;
    declare externalFtpEndpoint?: NonAttribute<ExternalFtpEndpoint>;

    declare static associations: {
        processingRule: Association<ProcessingRuleDestination, ProcessingRule>;
        localStorageFolder: Association<ProcessingRuleDestination, LocalStorageFolder>;
        externalApiEndpoint: Association<ProcessingRuleDestination, ExternalApiEndpoint>;
        externalFtpEndpoint: Association<ProcessingRuleDestination, ExternalFtpEndpoint>;
    };

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
                },
                local_storage_folder_id: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                external_api_endpoint_id: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                external_ftp_endpoint_id: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
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

    public static associate() {
        this.belongsTo(ProcessingRule, {
            foreignKey: 'processing_rule_id',
            as: 'processingRule',
        });

        this.belongsTo(LocalStorageFolder, {
            foreignKey: 'local_storage_folder_id',
            as: 'localStorageFolder',
        });

        this.belongsTo(ExternalApiEndpoint, {
            foreignKey: 'external_api_endpoint_id',
            as: 'externalApiEndpoint',
        });

        this.belongsTo(ExternalFtpEndpoint, {
            foreignKey: 'external_ftp_endpoint_id',
            as: 'externalFtpEndpoint',
        });
    }

    public static hook() {}
}
