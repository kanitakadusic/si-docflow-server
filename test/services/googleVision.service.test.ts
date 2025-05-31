import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleVisionService } from '../../src/services/googleVision.service';
import { IField } from '../../src/types/model';

// Mock `@google-cloud/vision`
vi.mock('@google-cloud/vision', () => {
  return {
    default: {
      ImageAnnotatorClient: vi.fn().mockImplementation(() => ({
        documentTextDetection: vi.fn(),
      })),
    },
  };
});

// Mock `sharp`
vi.mock('sharp', async () => {
  const sharpInstance = {
    metadata: vi.fn().mockResolvedValue({ width: 100, height: 20 }),
    composite: vi.fn().mockReturnThis(),
    png: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from('merged-image')),
  };

  const sharpFn = Object.assign(
    vi.fn(() => sharpInstance),
    {
      create: vi.fn(() => sharpInstance),
    }
  );

  return {
    default: sharpFn as unknown as typeof import('sharp'),
  };
});

describe('GoogleVisionService', () => {
  let service: GoogleVisionService;
  let mockClient: any;

  // Validni mock objekti
  const mockField: IField = {
    name: 'field1',
    upper_left: [0, 0] ,
    lower_right: [ 100, 20 ],
    is_multiline: false,
  };

  const mockCrops = [
    {
      field: mockField,
      image: Buffer.from('test'),
    },
  ];

  beforeEach(() => {
    service = new GoogleVisionService();
    mockClient = (service as any).client;
  });

  it('should extract fields and calculate confidence correctly', async () => {
    mockClient.documentTextDetection.mockResolvedValue([
      {
        fullTextAnnotation: {
          pages: [
            {
              blocks: [
                {
                  paragraphs: [
                    {
                      words: [
                        {
                          symbols: [
                            { text: 'H', confidence: 0.8 },
                            { text: 'i', confidence: 0.9 },
                          ],
                          boundingBox: { vertices: [{ y: 10 }] },
                          confidence: 0.85,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    ]);

    const results = await service.extractFieldsBatch(mockCrops);

    expect(results.length).toBe(1);
    expect(results[0].field.name).toBe('field1');
    expect(results[0].result.text).toBe('Hi');
    expect(results[0].result.confidence).toBeCloseTo(0.85, 2);
    expect(results[0].result.price).toBeCloseTo(1.5 / 1000, 5);
  });

  it('should return default values if no fullTextAnnotation', async () => {
    mockClient.documentTextDetection.mockResolvedValue([
      { fullTextAnnotation: null },
    ]);

    const results = await service.extractFieldsBatch(mockCrops);

    expect(results).toEqual([
      {
        field: mockField,
        result: {
          text: '',
          confidence: 0,
          price: 1.5 / 1000,
        },
      },
    ]);
  });

  it('startup and cleanup should resolve', async () => {
    await expect(service.startup('en')).resolves.toBeUndefined();
    await expect(service.cleanup()).resolves.toBeUndefined();
  });
});
