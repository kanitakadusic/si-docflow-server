import { join } from 'path';

export function generateTimestampFilename(): string {
    return new Date().toISOString().replace(/[:.]/g, '-');
}

export function normalizeUnixPath(path: string): string {
    return path
        .trim() // trim whitespace
        .replace(/\\/g, '/') // backslashes to slashes
        .replace(/^\/+|\/+$/g, '') // trim slashes start/end
        .replace(/\/+/g, '/'); // collapse multiple slashes
}

export function normalizePath(path: string): string {
    return join(...normalizeUnixPath(path).split('/'));
}
