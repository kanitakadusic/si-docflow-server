import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import dotenvSafe from 'dotenv-safe';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
    dotenvSafe.config({
        example: path.resolve(__dirname, '..', '.env.example'),
        path: path.resolve(__dirname, '..', '.env'),
    });
} catch (_) {
    console.error('Missing environment variable(s)');
    process.exit(1);
}

function getEnvVariable(name: string): string {
    if (!process.env[name]) {
        console.error(`Environment variable ${name} is undefined`);
        process.exit(1);
    }
    return process.env[name];
}

const googleCredentialsPath = path.join(__dirname, '..', 'google-credentials.json');
if (!fs.existsSync(googleCredentialsPath)) {
    const base64 = getEnvVariable('GOOGLE_CREDENTIALS_BASE64');

    try {
        const buffer = Buffer.from(base64, 'base64');
        fs.writeFileSync(googleCredentialsPath, buffer);
        console.log('Successfully created google-credentials.json');
    } catch (_) {
        console.error('Failed to create google-credentials.json');
        process.exit(1);
    }
}
process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join('.', 'google-credentials.json');

export const PORT: string = getEnvVariable('PORT');
export const DATABASE_URL: string = getEnvVariable('DATABASE_URL');

export const OPENAI_API_KEY: string = getEnvVariable('OPENAI_API_KEY');

export const AI_MODEL_NAME: string = getEnvVariable('AI_MODEL_NAME');
export const AI_MODEL_DOWNLOAD_URL: string = getEnvVariable('AI_MODEL_DOWNLOAD_URL');

export const ROOT: string = path.join(__dirname, '..');
