import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import dotenvSafe from 'dotenv-safe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
    dotenvSafe.config({
        example: path.resolve(__dirname, '..', '..', '.env.example'),
        path: path.resolve(__dirname, '..', '..', '.env'),
    });
} catch (error) {
    console.error('Missing environment variable(s):', error);
    process.exit(1);
}

function getEnvVariable(name: string): string {
    if (!process.env[name]) {
        console.error(`Environment variable ${name} is undefined`);
        process.exit(1);
    }
    return process.env[name];
}

export const PORT: string = getEnvVariable('PORT');
export const DATABASE_URL: string = getEnvVariable('DATABASE_URL');

export const GOOGLE_CREDENTIALS_BASE64: string = getEnvVariable('GOOGLE_CREDENTIALS_BASE64');

export const OPENAI_API_KEY: string = getEnvVariable('OPENAI_API_KEY');

export const AI_MODEL_NAME: string = getEnvVariable('AI_MODEL_NAME');
export const AI_MODEL_DOWNLOAD_URL: string = getEnvVariable('AI_MODEL_DOWNLOAD_URL');

export const STORAGE_LOCATION: string = getEnvVariable('STORAGE_LOCATION');
export const SUPABASE_URL: string = getEnvVariable('SUPABASE_URL');
export const SUPABASE_KEY: string = getEnvVariable('SUPABASE_KEY');

export const ROOT: string = path.join(__dirname, '..', '..');
