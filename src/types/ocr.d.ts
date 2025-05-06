import { IField } from '../database/models/documentLayout.model.js';

export interface IOcrResult {
    text: string;
    confidence: number;
}

export interface IMappedOcrResult {
    field: IField;
    ocrResult: IOcrResult;
}

export interface IOcrEngine {
    startup: (langCode: string) => Promise<void>;
    cleanup: () => Promise<void>;
    extract: (image: Buffer) => Promise<IOcrResult>;
}
