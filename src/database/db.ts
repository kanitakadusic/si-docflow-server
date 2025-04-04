import { Sequelize, DataTypes } from 'sequelize';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is not defined');
}
const connectionString: string = process.env.DATABASE_URL;

const sequelize = new Sequelize(connectionString, {
	dialect: 'postgres',
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const documentTypeModel = require(path.resolve(__dirname, './models/DocumentType'));

const db = {
  Sequelize: Sequelize,
  sequelize: sequelize,
  documentType: documentTypeModel(sequelize, DataTypes)
}

export default db;