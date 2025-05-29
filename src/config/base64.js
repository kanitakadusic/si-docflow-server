import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { readFile, writeFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputFile = path.resolve(__dirname, '..', '..', 'google-credentials.json');
const outputFile = path.resolve(__dirname, '..', '..', 'google-credentials-base64.txt');

const data = await readFile(inputFile);
const base64 = data.toString('base64');
await writeFile(outputFile, base64);
