import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { ProcessingRule } from './processingRule.model.js';
import { LocalStorageFolder } from './localStorageFolder.model.js';
import { ExternalApiEndpoint } from './externalApiEndpoint.model.js';
import { ExternalFtpEndpoint } from './externalFtpEndpoint.model.js';

interface IProcessingRuleDestination {
    id: number;
    processing_rule_id: number;
    local_storage_folder_id?: number | null;
    external_api_endpoint_id?: number | null;
    external_ftp_endpoint_id?: number | null;
    created_by: number;
    updated_by?: number;
}

type TProcessingRuleDestination = Optional<IProcessingRuleDestination, 'id'>;

export class ProcessingRuleDestination
    extends Model<IProcessingRuleDestination, TProcessingRuleDestination>
    implements IProcessingRuleDestination
{
    public id!: number;
    public processing_rule_id!: number;
    public local_storage_folder_id?: number | null;
    public external_api_endpoint_id?: number | null;
    public external_ftp_endpoint_id?: number | null;
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
                    allowNull: false,
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
