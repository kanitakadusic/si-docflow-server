import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { PORT } from './env.js';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'docflow-server api documentation',
        version: '1.0.0',
    },
    servers: [
        {
            url: `http://localhost:${PORT}`,
            description: 'Local development server',
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
