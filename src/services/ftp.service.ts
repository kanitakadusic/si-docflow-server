import { Client } from 'basic-ftp';
import { Readable } from 'stream';

import { generateTimestampFilename } from '../utils/path.util.js';

interface FtpUploadParams {
    host: string;
    port: number;
    user: string;
    password: string;
    secure: boolean;
    path: string;
    content: string;
}

export async function uploadToFtp({
    host,
    port,
    user,
    password,
    secure,
    path,
    content,
}: FtpUploadParams): Promise<boolean> {
    const client = new Client();
    try {
        await client.access({
            host,
            port,
            user,
            password,
            secure,
        });

        const stream = Readable.from(Buffer.from(content, 'utf-8'));
        const filename = `${generateTimestampFilename()}.json`;

        await client.ensureDir(path);
        await client.uploadFrom(stream, filename);

        return true;
    } catch (error) {
        console.error('FTP upload failure:', error);
        return false;
    } finally {
        client.close();
    }
}
