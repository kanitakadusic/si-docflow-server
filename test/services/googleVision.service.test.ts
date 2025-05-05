import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleVisionService } from '../../src/services/googleVision.service';

vi.mock('@google-cloud/vision', () => {
    return {
        default: {
            ImageAnnotatorClient: vi.fn().mockImplementation(() => ({
                documentTextDetection: vi.fn(),
            })),
        },
    };
});

describe('GoogleVisionService', () => {
    let service: GoogleVisionService;
    let mockClient: any;

    beforeEach(() => {
        service = new GoogleVisionService();
        mockClient = (service as any).client;
    });

    it('should extract text and compute average confidence', async () => {
        mockClient.documentTextDetection.mockResolvedValue([
            {
                fullTextAnnotation: {
                    text: 'Hello world',
                    pages: [
                        {
                            blocks: [
                                {
                                    paragraphs: [
                                        {
                                            words: [
                                                {
                                                    symbols: [{ confidence: 0.9 }, { confidence: 0.8 }],
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

        const buffer = Buffer.from('image');
        const result = await service.extract(buffer);

        expect(result.text).toBe('Hello world');
        expect(result.confidence).toBeCloseTo(0.85, 2);
    });

    it('should return default result if no fullTextAnnotation', async () => {
        mockClient.documentTextDetection.mockResolvedValue([
            {
                fullTextAnnotation: null,
            },
        ]);

        const buffer = Buffer.from('image');
        const result = await service.extract(buffer);

        expect(result).toEqual({ text: '', confidence: 0 });
    });

    it('startup and cleanup should resolve', async () => {
        await expect(service.startup('en')).resolves.toBeUndefined();
        await expect(service.cleanup()).resolves.toBeUndefined();
    });
});
