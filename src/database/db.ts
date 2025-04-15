import path from 'path';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

import { DocumentType } from './models/documentType.model';
import { AccessRight } from './models/accessRight.model';
import { DocumentLayout } from './models/documentLayout.model';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
}
const connectionString: string = process.env.DATABASE_URL;

const sequelize = new Sequelize(connectionString, {
    dialect: 'postgres',
    logging: false,
});

DocumentType.initialize(sequelize);
AccessRight.initialize(sequelize);
DocumentLayout.initialize(sequelize);

export { sequelize, DocumentType, AccessRight, DocumentLayout };
