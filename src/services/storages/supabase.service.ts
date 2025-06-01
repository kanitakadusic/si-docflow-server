import { supabase } from '../../config/supabaseClient.js';

import { generateTimestampFilename, normalizeUnixPath } from '../../utils/path.util.js';

export async function saveToSupabase(content: string, path: string): Promise<boolean> {
    try {
        const buffer = Buffer.from(content, 'utf-8');

        const filename = `${generateTimestampFilename()}.json`;
        const fullPath = normalizeUnixPath(path);

        const { error } = await supabase.storage.from('finalized-documents').upload(`${fullPath}/${filename}`, buffer, {
            contentType: 'application/json',
        });
        if (error) {
            console.error('Supabase storage failure:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Supabase storage failure:', error);
        return false;
    }
}
