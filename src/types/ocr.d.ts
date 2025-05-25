import { IField } from './model.js';

export interface IOcrResult {
    text: string;
    confidence: number;
    price: number;
}
export interface IMappedOcrResult {
    field: IField;
    result: IOcrResult;
}

export interface IMappedOcrResultWithImage {
    mappedResult: IMappedOcrResult;
    image: Buffer;
}

export interface IOcrEngine {
    startup: (langCode: string) => Promise<void>;
    cleanup: () => Promise<void>;
    extractSingleField?: (image: Buffer) => Promise<IOcrResultWithPrice>;
    extractFieldsBatch?: (crops: { field: IField; image: Buffer }[]) => Promise<IMappedOcrResult[]>;
}

export interface IOcrResultFinalized extends IOcrResult {
    isCorrected: boolean;
}

export interface IMappedOcrResultFinalized {
    field: IField;
    result: IOcrResultFinalized;
}
