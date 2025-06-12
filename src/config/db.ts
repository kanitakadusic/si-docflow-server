import { Sequelize } from 'sequelize';

import { DATABASE_URL } from './env.js';

import { DocumentType } from '../models/documentType.model.js';
import { AccessRight } from '../models/accessRight.model.js';
import { DocumentLayout } from '../models/documentLayout.model.js';
import { LayoutImage } from '../models/layoutImage.model.js';
import { ProcessingRule } from '../models/processingRule.model.js';
import { LocalStorageFolder } from '../models/localStorageFolder.model.js';
import { ExternalApiEndpoint } from '../models/externalApiEndpoint.model.js';
import { ExternalFtpEndpoint } from '../models/externalFtpEndpoint.model.js';
import { ProcessingRuleDestination } from '../models/processingRuleDestination.model.js';
import { AiProvider } from '../models/aiProvider.model.js';
import { ProcessingRequestsBillingLog } from '../models/processingRequestsBillingLog.model.js';
import { ProcessingResultsTriplet } from '../models/processingResultsTriplet.model.js';
import { FinalizedDocument } from '../models/finalizedDocument.js';

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
AiProvider.initialize(sequelize);
ProcessingRequestsBillingLog.initialize(sequelize);
ProcessingResultsTriplet.initialize(sequelize);
FinalizedDocument.initialize(sequelize);

DocumentType.associate();
AccessRight.associate();
DocumentLayout.associate();
LayoutImage.associate();
ProcessingRule.associate();
LocalStorageFolder.associate();
ExternalApiEndpoint.associate();
ExternalFtpEndpoint.associate();
ProcessingRuleDestination.associate();
AiProvider.associate();
ProcessingRequestsBillingLog.associate();
ProcessingResultsTriplet.associate();
FinalizedDocument.associate();

DocumentType.hook();
AccessRight.hook();
DocumentLayout.hook();
LayoutImage.hook();
ProcessingRule.hook();
LocalStorageFolder.hook();
ExternalApiEndpoint.hook();
ExternalFtpEndpoint.hook();
ProcessingRuleDestination.hook();
AiProvider.hook();
ProcessingRequestsBillingLog.hook();
ProcessingResultsTriplet.hook();
FinalizedDocument.hook();

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
    AiProvider,
    ProcessingRequestsBillingLog,
    ProcessingResultsTriplet,
    FinalizedDocument,
};
