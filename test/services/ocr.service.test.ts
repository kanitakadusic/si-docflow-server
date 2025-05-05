import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OcrService } from '../../src/services/ocr.service';
import { IField } from '../../src/database/models/documentLayout.model';
import { IOcrEngine } from '../../src/types/ocr';

// Mock sharp
vi.mock('sharp', () => ({
    default: () => ({
        extract: vi.fn().mockReturnThis(),
        png: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockResolvedValue(Buffer.from('mocked image')),
    }),
}));

describe('OcrService', () => {
    let ocrService: OcrService;
    let mockTesseractService: IOcrEngine;

    beforeEach(() => {
        ocrService = new OcrService();

        mockTesseractService = {
            startup: vi.fn().mockResolvedValue(undefined),
            cleanup: vi.fn().mockResolvedValue(undefined),
            extract: vi.fn().mockResolvedValue({
                text: 'mock text',
                confidence: 0.9,
            }),
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should extract text from fields', async () => {
        const image = Buffer.from('test image');
        const fields: IField[] = [
            {
                name: 'field2',
                upper_left: [0, 0],
                lower_right: [100, 100],
                is_multiline: true,
            },
        ];

        const results = await ocrService.extractFields(image, fields, mockTesseractService);

        expect(results).toHaveLength(1);
        expect(results[0].field).toEqual(fields[0]);
        expect(results[0].ocrResult.text).toBe('mock text');
        expect(results[0].ocrResult.confidence).toBe(0.9);
    });
});
