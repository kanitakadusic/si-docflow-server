import express from 'express';

import { PORT } from './config.js';
import { bootstrap } from './bootstrap.js';
import { shutdown } from './shutdown.js';

import ocrRoutes from './routes/document.routes.js';
import documentTypeRoutes from './routes/documentType.routes.js';
import documentLayoutRoutes from './routes/documentLayout.routes.js';

const app = express();

app.use('/document', ocrRoutes);
app.use('/document', documentTypeRoutes);
app.use('/document', documentLayoutRoutes);

// server initialization
await bootstrap();

app.listen(PORT);

// server shutdown
process.on('SIGINT', async (): Promise<never> => {
    await shutdown();
    process.exit(0);
});
process.on('SIGTERM', async (): Promise<never> => {
    await shutdown();
    process.exit(0);
});
