import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatGptService } from '../../src/services/chatGpt.service';
import { IField } from '../../src/types/model';
import sharp from 'sharp'; 

// Mock za OpenAI
vi.mock('openai', () => {
    const mockCreate = vi.fn();
    return {
        default: vi.fn().mockImplementation(() => ({
            chat: {
                completions: {
                    create: mockCreate,
                },
            },
        })),
    };
});

vi.mock('sharp', () => {
    const sharpInstance = {
        metadata: vi.fn().mockResolvedValue({ width: 100 }),
        composite: vi.fn().mockReturnThis(),
        png: vi.fn().mockReturnThis(),
        toBuffer: vi.fn().mockResolvedValue(Buffer.from('merged-image')),
    };

    const sharpMock = vi.fn(() => sharpInstance);

    return { default: sharpMock }; // ← ESM očekuje ovo!
});


describe('ChatGptService', () => {
    let service: ChatGptService;
    let mockCreate: any;

    beforeEach(() => {
        service = new ChatGptService();
        mockCreate = (ChatGptService as any).openAi.chat.completions.create;
    });

    it('should extract fields from GPT response', async () => {
        const crops = [
            {
                field: { name: 'field1' } as IField,
                image: Buffer.from('img1'),
            },
            {
                field: { name: 'field2' } as IField,
                image: Buffer.from('img2'),
            },
        ];

        mockCreate.mockResolvedValue({
            choices: [
                {
                    message: {
                        content: JSON.stringify([
                            { text: 'Text 1', confidence: 0.9 },
                            { text: 'Text 2', confidence: 0.8 },
                        ]),
                    },
                },
            ],
            usage: {
                prompt_tokens: 100,
                completion_tokens: 200,
            },
        });

        const results = await service.extractFieldsBatch(crops);

        expect(results).toHaveLength(2);
        expect(results[0].field.name).toBe('field1');
        expect(results[0].result.text).toBe('Text 1');
        expect(results[0].result.confidence).toBe(0.9);
        expect(results[1].result.text).toBe('Text 2');
        expect(results[1].result.confidence).toBe(0.8);
        expect(results[0].result.price).toBeGreaterThan(0);
    });

    it('should return default results on JSON parse error', async () => {
        const crops = [
            {
                field: { name: 'field1' } as IField,
                image: Buffer.from('img1'),
            },
        ];

        mockCreate.mockResolvedValue({
            choices: [
                {
                    message: {
                        content: 'invalid json',
                    },
                },
            ],
            usage: null,
        });

        const results = await service.extractFieldsBatch(crops);

        expect(results).toHaveLength(1);
        expect(results[0].result.text).toBe('');
        expect(results[0].result.confidence).toBe(0);
        expect(results[0].result.price).toBe(0);
    });

    it('startup and cleanup should do nothing', async () => {
        await expect(service.startup('en')).resolves.toBeUndefined();
        await expect(service.cleanup()).resolves.toBeUndefined();
    });
});
