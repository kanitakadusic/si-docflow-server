import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, Sequelize } from 'sequelize';

export class FinalizedDocument extends Model<
    InferAttributes<FinalizedDocument>,
    InferCreationAttributes<FinalizedDocument>
> {
    declare id: CreationOptional<number>;
    declare content: string;

    public static initialize(sequelize: Sequelize) {
        this.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true,
                },
                content: {
                    type: DataTypes.JSONB,
                    allowNull: false,
                },
            },
            {
                sequelize,
                modelName: 'FinalizedDocument',
                tableName: 'finalized_documents',
            },
        );
    }

    public static associate() {}

    public static hook() {}
}
