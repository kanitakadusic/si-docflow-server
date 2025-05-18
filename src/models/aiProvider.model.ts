import { 
    Association,
    CreationOptional, 
    DataTypes, 
    InferAttributes, 
    InferCreationAttributes, 
    Model, 
    NonAttribute, 
    Sequelize 
} from 'sequelize';
import { ProcessingRequestBillingLog } from './processingRequestsBillingLog.model.js';
import { ProcessingResultsTriplet } from './processingResultsTriplet.model.js';

export class AiProvider extends Model<InferAttributes<AiProvider>, InferCreationAttributes<AiProvider>> {
    declare id: CreationOptional<number>;
    declare name: string;

    declare processingRequestsBillingLogs?: NonAttribute<ProcessingRequestBillingLog[]>;
    declare processingResultsTriplets?: NonAttribute<ProcessingResultsTriplet[]>;

    declare static associations: {
        processingRequestsBillingLogs: Association<AiProvider, ProcessingRequestBillingLog>;
        processingResultsTriplets: Association<AiProvider, ProcessingResultsTriplet>;
    }

    public static initialize(sequelize: Sequelize) {
        this.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
            },
            {
                sequelize,
                modelName: 'AIProvider',
                tableName: 'ai_providers',
                freezeTableName: true,
            },
        );
    }

    public static associate() {
        this.belongsTo(ProcessingRequestBillingLog, {
            foreignKey: 'id',
            as: 'processingRequestBillingLogs'
        });
        this.belongsTo(ProcessingResultsTriplet, {
            foreignKey: 'id',
            as: 'processingResultTriplets',
        });
    }

    public static hook() {}
}