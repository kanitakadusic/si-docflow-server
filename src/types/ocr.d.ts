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

// so json that gets returned to user, does not have image data in it
export interface IMappedOcrResultWithImage {
    mappedResult: IMappedOcrResult;
    image: Buffer;
}
export interface IOcrEngine {
    startup: (langCode: string) => Promise<void>;
    cleanup: () => Promise<void>;
    extract: (image: Buffer) => Promise<IOcrResultWithPrice>;
    extractFieldsBatch?(crops: { field: IField; image: Buffer }[]): Promise<IMappedOcrResult[]>;
}

export interface IOcrResultFinalized extends IOcrResult {
    isCorrected: boolean;
}
export interface IMappedOcrResultFinalized {
    field: IField;
    result: IOcrResultFinalized;
}
