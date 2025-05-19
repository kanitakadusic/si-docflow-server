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
import { DocumentType } from './documentType.model.js';
import { ProcessingRuleDestination } from './processingRuleDestination.model.js';

export class ProcessingRule extends Model<InferAttributes<ProcessingRule>, InferCreationAttributes<ProcessingRule>> {
    declare id: CreationOptional<number>;
    declare title: string;
    declare description: string | null;
    declare document_type_id: ForeignKey<DocumentType['id']>;
    declare is_active: boolean;
    declare created_by: number;
    declare updated_by: number | null;

    declare documentType?: NonAttribute<DocumentType>;
    declare processingRuleDestinations?: NonAttribute<ProcessingRuleDestination[]>;

    declare static associations: {
        documentType: Association<ProcessingRule, DocumentType>;
        processingRuleDestinations: Association<ProcessingRule, ProcessingRuleDestination>;
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
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                description: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                document_type_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                is_active: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
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
                modelName: 'ProcessingRule',
                tableName: 'processing_rules',
            },
        );
    }

    public static associate() {
        this.belongsTo(DocumentType, {
            foreignKey: 'id',
            as: 'documentType',
        });

        this.hasMany(ProcessingRuleDestination, {
            foreignKey: 'processing_rule_id',
            as: 'processingRuleDestinations',
        });
    }

    public static hook() {}
}
