import { IField } from './model.js';

export interface IFieldWithCrop extends IField {
    crop: Buffer;
}

export interface IOcrResult {
    text: string;
    confidence: number;
    price: number;
}

export interface IMappedOcrResult {
    field: IField;
    result: IOcrResult;
}

export interface IMappedOcrResultWithCrop {
    fieldWithCrop: IFieldWithCrop;
    result: IOcrResult;
}

export interface IOcrEngine {
    startup: (langCode: string) => Promise<void>;
    cleanup: () => Promise<void>;
    extractSingleField?: (crop: Buffer) => Promise<IOcrResult>;
    extractFieldsBatch?: (fieldsWithCrop: IFieldWithCrop[]) => Promise<IMappedOcrResultWithCrop[]>;
}
