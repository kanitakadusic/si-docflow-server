import dotenv from 'dotenv-safe';
import express from 'express';
import db from './database/db';
import documentRoutes from './routes/document.routes';
import documentTypesRoutes from './routes/documentTypes.routes';

dotenv.config();

const APP = express();
const PORT = process.env.PORT;

db.sequelize.authenticate().then(() => {
	console.log('Successfully connected to the database');
});

APP.use('/document', documentRoutes);
APP.use('/document', documentTypesRoutes);

APP.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
