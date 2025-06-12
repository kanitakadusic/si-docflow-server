import express from 'express';

import { PORT } from './config/env.js';
import { swaggerSpec, swaggerUi } from './config/swagger.js';

import documentRoutes from './routes/document.routes.js';
import documentTypeRoutes from './routes/documentType.routes.js';
import documentLayoutRoutes from './routes/documentLayout.routes.js';

const app = express();

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/document', documentRoutes);
app.use('/document', documentTypeRoutes);
app.use('/document', documentLayoutRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API docs available at http://localhost:${PORT}/api-docs`);
});
