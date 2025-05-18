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

import { AiProvider } from "./aiProvider.model.js";

export class ProcessingResultsTriplet extends Model<InferAttributes<ProcessingResultsTriplet>, InferCreationAttributes<ProcessingResultsTriplet>> {
    declare id: CreationOptional<number>;
    declare image: Buffer;
    declare ai_data: string;
    declare user_data: string;
    declare ai_provider_id: ForeignKey<AiProvider['id']>;

    declare aiProvider?: NonAttribute<AiProvider>;

    declare static associations: {
        aiProvider: Association<ProcessingResultsTriplet, AiProvider>;
    }

    public static initialize(sequelize: Sequelize) {
        this.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            image: {
                type: DataTypes.BLOB("medium"), // Medium - up to 16MB
                allowNull: false,
            },
            ai_data: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            user_data: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            ai_provider_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: AiProvider, 
                    key: "id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
        },
        {
            sequelize,
            modelName: "ProcessingResultsTriplet",
            tableName: "processing_results_triplets",
            freezeTableName: true,
        }
    );
    }

    public static associate() {
        this.hasOne(AiProvider, {
            foreignKey: 'id',
            as: 'aiProvider'
        });
    }

    public static hook() {}
}