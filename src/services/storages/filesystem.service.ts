import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';

import { ROOT } from '../../config/env.js';

import { generateTimestampFilename, normalizePath } from '../../utils/path.util.js';

export async function saveToFilesystem(content: string, path: string): Promise<boolean> {
    try {
        const filename = `${generateTimestampFilename()}.json`;
        const fullPath = join(ROOT, 'finalized_documents', normalizePath(path));

        await mkdir(fullPath, { recursive: true });
        await writeFile(join(fullPath, filename), content, 'utf-8');

        return true;
    } catch (error) {
        console.error('Filesystem storage failure:', error);
        return false;
    }
}
