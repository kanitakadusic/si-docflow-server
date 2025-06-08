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

import { ProcessingRequestsBillingLog } from './processingRequestsBillingLog.model.js';
import { ProcessingResultsTriplet } from './processingResultsTriplet.model.js';

export class AiProvider extends Model<InferAttributes<AiProvider>, InferCreationAttributes<AiProvider>> {
    declare id: CreationOptional<number>;
    declare name: string;

    declare processingRequestsBillingLogs?: NonAttribute<ProcessingRequestsBillingLog[]>;
    declare processingResultsTriplets?: NonAttribute<ProcessingResultsTriplet[]>;

    declare static associations: {
        processingRequestsBillingLogs: Association<AiProvider, ProcessingRequestsBillingLog>;
        processingResultsTriplets: Association<AiProvider, ProcessingResultsTriplet>;
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
                    unique: true,
                },
            },
            {
                sequelize,
                modelName: 'AiProvider',
                tableName: 'ai_providers',
            },
        );
    }

    public static associate() {
        this.hasMany(ProcessingRequestsBillingLog, {
            foreignKey: 'ai_provider_id',
            as: 'processingRequestsBillingLogs',
        });

        this.hasMany(ProcessingResultsTriplet, {
            foreignKey: 'ai_provider_id',
            as: 'processingResultsTriplets',
        });
    }

    public static hook() {}
}
