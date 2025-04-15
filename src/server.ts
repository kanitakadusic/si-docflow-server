import path from 'path';
import dotenv from 'dotenv-safe';
import express from 'express';

import { sequelize } from './database/db';
import documentRoutes from './routes/document.routes';
import documentTypeRoutes from './routes/documentType.routes';
import documentLayoutRoutes from './routes/documentLayout.routes';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.PORT) {
    throw new Error('PORT is not defined');
}
const PORT: string = process.env.PORT;

const APP = express();

sequelize.authenticate().then(() => {
    console.log('Successfully connected to the database');
});

APP.use('/document', documentRoutes);
APP.use('/document', documentTypeRoutes);
APP.use('/document', documentLayoutRoutes);

APP.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
