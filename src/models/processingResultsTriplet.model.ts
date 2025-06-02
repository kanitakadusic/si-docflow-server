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

import { AiProvider } from './aiProvider.model.js';

export class ProcessingResultsTriplet extends Model<
    InferAttributes<ProcessingResultsTriplet>,
    InferCreationAttributes<ProcessingResultsTriplet>
> {
    declare id: CreationOptional<number>;
    declare image: Buffer;
    declare ai_data: string;
    declare user_data: string;
    declare ai_provider_id: ForeignKey<AiProvider['id']>;

    declare aiProvider?: NonAttribute<AiProvider>;

    declare static associations: {
        aiProvider: Association<ProcessingResultsTriplet, AiProvider>;
    };

    public static initialize(sequelize: Sequelize) {
        this.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                image: {
                    type: DataTypes.BLOB('medium'),
                    allowNull: false,
                },
                ai_data: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                user_data: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                ai_provider_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
            },
            {
                sequelize,
                modelName: 'ProcessingResultsTriplet',
                tableName: 'processing_results_triplets',
            },
        );
    }

    public static associate() {
        this.belongsTo(AiProvider, {
            foreignKey: 'ai_provider_id',
            as: 'aiProvider',
        });
    }

    public static hook() {}
}
