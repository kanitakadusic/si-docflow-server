import express from 'express';

import { PORT } from './config.js';

import { sequelize } from './database/db.js';
import documentRoutes from './routes/document.routes.js';
import documentTypeRoutes from './routes/documentType.routes.js';
import documentLayoutRoutes from './routes/documentLayout.routes.js';

sequelize.authenticate().then(() => {
    console.log('Successfully connected to the database');
});

const app = express();
app.use(express.json());

app.use('/document', documentRoutes);
app.use('/document', documentTypeRoutes);
app.use('/document', documentLayoutRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
