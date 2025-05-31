import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OcrService } from '../../src/services/ocr.service';
import { IField } from '../../src/types/model';

// Mock for sharp
vi.mock('sharp', () => ({
    default: () => ({
        extract: vi.fn().mockReturnThis(),
        png: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockResolvedValue(Buffer.from('mocked image')),
    }),
}));

// Mock for TesseractService
const mockExtract = vi.fn().mockResolvedValue({
    text: 'mocked text',
    confidence: 0.95,
});

const mockStartup = vi.fn().mockResolvedValue(undefined);
const mockCleanup = vi.fn().mockResolvedValue(undefined);

vi.mock('../../src/services/tesseract.service', () => {
    return {
        TesseractService: vi.fn().mockImplementation(() => ({
            extract: mockExtract,
            startup: mockStartup,
            cleanup: mockCleanup,
        })),
    };
});

describe('OcrService', () => {
    let service: OcrService;

    beforeEach(() => {
        service = new OcrService();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should extract fields and return mapped OCR results (extractFields)', async () => {
        const dummyImage = Buffer.from('fake image');
        const fields: IField[] = [
            {
                name: 'field1',
                upper_left: [10.2, 20.8],
                lower_right: [110.6, 120.4],
                is_multiline: false,
            },
        ];

        const mockEngine = {
            extract: vi.fn().mockResolvedValue({
                text: 'mocked text',
                confidence: 0.95,
            }),
            startup: vi.fn().mockResolvedValue(undefined),
            cleanup: vi.fn().mockResolvedValue(undefined),
        };

        const results = await service.extractFields(dummyImage, fields, mockEngine);

        expect(results).toHaveLength(1);
        expect(results[0].mappedResult.field.name).toBe('field1');
        expect(results[0].mappedResult.result.text).toBe('mocked text');
        expect(results[0].mappedResult.result.confidence).toBe(0.95);
        expect(mockEngine.extract).toHaveBeenCalledTimes(1);
    });

    it('should run OCR using tesseract engine (runOcr)', async () => {
        const dummyImage = Buffer.from('fake image');
        const fields: IField[] = [
            {
                name: 'field2',
                upper_left: [0, 0],
                lower_right: [100, 100],
                is_multiline: true,
            },
        ];

        const results = await service.runOcr(dummyImage, fields, 'tesseract', 'bos');

        expect(mockStartup).toHaveBeenCalledWith('bos');
        expect(mockExtract).toHaveBeenCalled();
        expect(mockCleanup).toHaveBeenCalled();
        expect(results).toHaveLength(1);
        expect(results[0].mappedResult.result.text).toBe('mocked text');
    });

    it('should throw error on unsupported OCR engine', async () => {
        const dummyImage = Buffer.from('fake image');
        const fields: IField[] = [];

        await expect(service.runOcr(dummyImage, fields, 'unsupportedEngine', 'bos')).rejects.toThrow(
            'Unsupported OCR engine: unsupportedEngine',
        );
    });
});
