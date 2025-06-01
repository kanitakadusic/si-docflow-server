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
import { AiProvider } from './aiProvider.model.js';

export class ProcessingRequestsBillingLog extends Model<
    InferAttributes<ProcessingRequestsBillingLog>,
    InferCreationAttributes<ProcessingRequestsBillingLog>
> {
    declare id: CreationOptional<number>;
    declare document_type_id: ForeignKey<DocumentType['id']>;
    declare ai_provider_id: ForeignKey<AiProvider['id']>;
    declare price: number;

    declare documentType?: NonAttribute<DocumentType>;
    declare aiProvider?: NonAttribute<AiProvider>;

    declare static associations: {
        documentType: Association<ProcessingRequestsBillingLog, DocumentType>;
        aiProvider: Association<ProcessingRequestsBillingLog, AiProvider>;
    };

    public static initialize(sequelize: Sequelize) {
        this.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                document_type_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                ai_provider_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                price: {
                    type: DataTypes.DOUBLE,
                    allowNull: false,
                },
            },
            {
                sequelize,
                modelName: 'ProcessingRequestsBillingLog',
                tableName: 'processing_requests_billing_logs',
            },
        );
    }

    public static associate() {
        this.belongsTo(DocumentType, {
            foreignKey: 'document_type_id',
            as: 'documentType',
        });

        this.belongsTo(AiProvider, {
            foreignKey: 'ai_provider_id',
            as: 'aiProvider',
        });
    }

    public static hook() {}
}
