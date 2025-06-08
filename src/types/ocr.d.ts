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

export interface IProcessResult {
    engine: string;
    ocr: IMappedOcrResult[];
    triplet_ids: number[];
}

export interface IProcessResponse {
    document_type_id: number;
    process_results: IProcessResult[];
}
