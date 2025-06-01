import {
    Association,
    CreationOptional,
    DataTypes,
    DestroyOptions,
    ForeignKey,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
    Sequelize,
} from 'sequelize';

import { DocumentLayout } from './documentLayout.model.js';
import { ProcessingRule } from './processingRule.model.js';
import { ProcessingRequestsBillingLog } from './processingRequestsBillingLog.model.js';

export class DocumentType extends Model<InferAttributes<DocumentType>, InferCreationAttributes<DocumentType>> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare description: string | null;
    declare document_layout_id: ForeignKey<DocumentLayout['id']>;
    declare created_by: number | null;
    declare updated_by: number | null;

    declare documentLayout?: NonAttribute<DocumentLayout>;
    declare processingRules?: NonAttribute<ProcessingRule[]>;
    declare processingRequestsBillingLogs?: NonAttribute<ProcessingRequestsBillingLog[]>;

    declare static associations: {
        documentLayout: Association<DocumentType, DocumentLayout>;
        processingRules: Association<DocumentType, ProcessingRule>;
        processingRequestsBillingLogs: Association<DocumentType, ProcessingRequestsBillingLog>;
    };

    public static initialize(sequelize: Sequelize) {
        this.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                name: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                document_layout_id: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    unique: true,
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
                modelName: 'DocumentType',
                tableName: 'document_types',
            },
        );
    }

    public static associate() {
        this.belongsTo(DocumentLayout, {
            foreignKey: 'document_layout_id',
            as: 'documentLayout',
        });

        this.hasMany(ProcessingRule, {
            foreignKey: 'document_type_id',
            as: 'processingRules',
        });

        this.hasMany(ProcessingRequestsBillingLog, {
            foreignKey: 'document_type_id',
            as: 'processingRequestsBillingLogs',
        });
    }

    public static hook() {
        this.addHook('afterDestroy', async (type: DocumentType, options: DestroyOptions) => {
            const layoutId: number | null = type.document_layout_id;
            if (layoutId) {
                await DocumentLayout.destroy({
                    where: { id: layoutId },
                    transaction: options.transaction,
                    individualHooks: true,
                });
            }
        });
    }
}
