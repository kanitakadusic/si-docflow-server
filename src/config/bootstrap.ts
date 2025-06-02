import { join } from 'path';
import fs from 'fs';
import { Downloader } from 'nodejs-file-downloader';

import { AI_MODEL_DOWNLOAD_URL, AI_MODEL_NAME, GOOGLE_CREDENTIALS_BASE64, ROOT } from './env.js';

import { sequelize } from './db.js';

if (!fs.existsSync(join(ROOT, 'google-credentials.json'))) {
    try {
        const buffer = Buffer.from(GOOGLE_CREDENTIALS_BASE64, 'base64');

        fs.writeFileSync(join(ROOT, 'google-credentials.json'), buffer);
        console.log('Google credentials successfully prepared');
    } catch (error) {
        console.error('Failed to prepare Google credentials:', error);
        process.exit(1);
    }
}

if (!fs.existsSync(join(ROOT, 'ai_model'))) {
    fs.mkdirSync(join(ROOT, 'ai_model'));
}
if (!fs.existsSync(join(ROOT, 'ai_model', AI_MODEL_NAME))) {
    try {
        const downloader = new Downloader({
            url: AI_MODEL_DOWNLOAD_URL,
            directory: join(ROOT, 'ai_model'),
            fileName: AI_MODEL_NAME,
            timeout: 90000,
        });

        await downloader.download();
        console.log('AI model successfully downloaded');
    } catch (error) {
        console.error('Failed to download AI model:', error);
        process.exit(1);
    }
}

sequelize.authenticate().then(() => {
    console.log('Successfully connected to the database');
});
