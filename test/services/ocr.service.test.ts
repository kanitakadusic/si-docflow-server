import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OcrService } from '../../src/services/ocr.service';
import { IField } from '../../src/types/model.js';
import { IOcrEngine } from '../../src/types/ocr';

vi.mock('sharp', () => {
  return {
    default: () => ({
      extract: vi.fn().mockReturnThis(),
      png: vi.fn().mockReturnThis(),
      toBuffer: vi.fn().mockResolvedValue(Buffer.from('cropped image')),
    }),
  };
});

describe('OcrService', () => {
    let ocrService: OcrService;
    let mockEngine: IOcrEngine;

    beforeEach(() => {
        ocrService = new OcrService();

        mockEngine = {
            startup: vi.fn(),
            cleanup: vi.fn(),
            extract: vi.fn().mockResolvedValue({
                text: 'mock\ntext',
                confidence: 0.95,
            }),
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should extract flatten text if is_multiline is false', async () => {
        const image = Buffer.from('test image');
        const fields: IField[] = [
            {
                name: 'Name',
                upper_left: [0, 0],
                lower_right: [100, 100],
                is_multiline: false,
            },
        ];

        const results = await ocrService.extractFields(image, fields, mockEngine);

        expect(results).toHaveLength(1);
        expect(results[0].mappedResult.field).toEqual(fields[0]);
        expect(results[0].mappedResult.result.text).toBe('mocktext');
        expect(results[0].mappedResult.result.confidence).toBe(0.95);
    });

    it('should keep multiline text if is_multiline is true', async () => {
      const image = Buffer.from('dummy');
      const fields: IField[] = [
        {
          name: 'Description',
          upper_left: [10, 10],
          lower_right: [100, 100],
          is_multiline: true,
        },
      ];

      const result = await ocrService.extractFields(image, fields, mockEngine);

      expect(result[0].mappedResult.result.text).toBe('mock\ntext');
    });
});