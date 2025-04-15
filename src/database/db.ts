import { DataTypes, Sequelize } from 'sequelize';
import path from 'path';
import dotenv from 'dotenv';

const documentTypesModel = require(path.resolve(__dirname, './models/documentTypes.model'));
const accessRightsModel = require(path.resolve(__dirname, './models/accessRights.model'));

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is not defined');
}
const connectionString: string = process.env.DATABASE_URL;

const sequelize = new Sequelize(connectionString, {
	dialect: 'postgres',
	logging: false,
});

const db = {
	Sequelize: Sequelize,
	sequelize: sequelize,
	documentTypes: documentTypesModel(sequelize, DataTypes),
	accessRights: accessRightsModel(sequelize, DataTypes),
};

export default db;
