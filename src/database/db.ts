import { Sequelize } from 'sequelize';

import { DATABASE_URL } from '../config.js';

import { DocumentType } from './models/documentType.model.js';
import { AccessRight } from './models/accessRight.model.js';
import { DocumentLayout } from './models/documentLayout.model.js';
import { LayoutImage } from './models/layoutImage.model.js';

const sequelize: Sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
});

DocumentType.initialize(sequelize);
AccessRight.initialize(sequelize);
DocumentLayout.initialize(sequelize);
LayoutImage.initialize(sequelize);

export { sequelize, DocumentType, AccessRight, DocumentLayout, LayoutImage };
