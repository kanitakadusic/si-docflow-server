import { 
    CreationOptional, 
    ForeignKey, 
    InferAttributes, 
    InferCreationAttributes, 
    Model, 
    Sequelize, 
    DataTypes, 
    NonAttribute,
    Association
} from "sequelize";

import { DocumentType } from "./documentType.model.js";
import { AiProvider } from "./aiProvider.model.js";

export class ProcessingRequestBillingLog extends Model<
    InferAttributes<ProcessingRequestBillingLog>,
    InferCreationAttributes<ProcessingRequestBillingLog>
> {
    declare id: CreationOptional<number>;
    declare document_type_id: ForeignKey<DocumentType['id']>;
    declare file_name: string;
    declare ai_provider_id: ForeignKey<AiProvider['id']>;
    declare price: number;

    declare documentType?: NonAttribute<DocumentType>;
    declare aiProvider?: NonAttribute<AiProvider>;

    declare static associations: {
        documentType: Association<ProcessingRequestBillingLog, DocumentType>;
        aiProvider: Association<ProcessingRequestBillingLog, AiProvider>;
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
                    references: {
                        model: DocumentType,
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                },
                file_name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                ai_provider_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: AiProvider,
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
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
                freezeTableName: true,
            },
        );
    }

    public static associate() {
        this.hasOne(DocumentType, {
            foreignKey: 'id',
            as: 'documentType'
        });

        this.hasOne(AiProvider, {
            foreignKey: 'id',
            as: 'aiProvider'
        });
    }

    public static hook() {}
}