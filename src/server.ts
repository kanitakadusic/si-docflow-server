import express from 'express';
import dotenv from 'dotenv-safe';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const documentTypeRoutes = require('./routes/documentTypeRoutes');

import db from './database/db'

db.sequelize.authenticate().then(() => {
	console.log("database ok");
})

dotenv.config();

const APP = express();
const PORT = process.env.PORT || 5000;

APP.use('/document-types', documentTypeRoutes);

APP.get('/', (req, res) => {
	res.json({ message: 'Hello from processing server!' });
});

APP.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
