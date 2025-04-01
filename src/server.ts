import express from 'express';
import add from './example/math';
import dotenv from 'dotenv-safe';

dotenv.config();

const APP = express();
const PORT = process.env.PORT || 5000;

console.log(add(2, 3));

APP.get('/api/message', (req, res) => {
	res.json({ message: 'Hello from processing server!' });
});

APP.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
