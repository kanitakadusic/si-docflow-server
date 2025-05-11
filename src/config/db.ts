import { Sequelize } from 'sequelize';

import { DATABASE_URL } from './config.js';

import { DocumentType } from '../models/documentType.model.js';
import { AccessRight } from '../models/accessRight.model.js';
import { DocumentLayout } from '../models/documentLayout.model.js';
import { LayoutImage } from '../models/layoutImage.model.js';
import { ProcessingRule } from '../models/processingRule.model.js';
import { LocalStorageFolder } from '../models/localStorageFolder.model.js';
import { ExternalApiEndpoint } from '../models/externalApiEndpoint.model.js';
import { ExternalFtpEndpoint } from '../models/externalFtpEndpoint.model.js';
import { ProcessingRuleDestination } from '../models/processingRuleDestination.model.js';

const sequelize: Sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
});

DocumentType.initialize(sequelize);
AccessRight.initialize(sequelize);
DocumentLayout.initialize(sequelize);
LayoutImage.initialize(sequelize);
ProcessingRule.initialize(sequelize);
LocalStorageFolder.initialize(sequelize);
ExternalApiEndpoint.initialize(sequelize);
ExternalFtpEndpoint.initialize(sequelize);
ProcessingRuleDestination.initialize(sequelize);

DocumentType.associate();
AccessRight.associate();
DocumentLayout.associate();
LayoutImage.associate();
ProcessingRule.associate();
LocalStorageFolder.associate();
ExternalApiEndpoint.associate();
ExternalFtpEndpoint.associate();
ProcessingRuleDestination.associate();

DocumentType.hook();
AccessRight.hook();
DocumentLayout.hook();
LayoutImage.hook();
ProcessingRule.hook();
LocalStorageFolder.hook();
ExternalApiEndpoint.hook();
ExternalFtpEndpoint.hook();
ProcessingRuleDestination.hook();

export {
    sequelize,
    DocumentType,
    AccessRight,
    DocumentLayout,
    LayoutImage,
    ProcessingRule,
    LocalStorageFolder,
    ExternalApiEndpoint,
    ExternalFtpEndpoint,
    ProcessingRuleDestination,
};
