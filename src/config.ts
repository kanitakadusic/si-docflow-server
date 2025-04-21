import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import dotenvSafe from 'dotenv-safe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
    dotenvSafe.config({
        example: path.resolve(__dirname, '../.env.example'),
        path: path.resolve(__dirname, '../.env'),
    });
} catch (_) {
    console.error('🛑 Missing environment variable(s)');
    process.exit(1);
}

function getEnvVariable(name: string): string {
    if (!process.env[name]) {
        console.error(`🛑 Environment variable ${name} is undefined`);
        process.exit(1);
    }
    return process.env[name];
}

export const PORT: string = getEnvVariable('PORT');
export const DATABASE_URL: string = getEnvVariable('DATABASE_URL');
