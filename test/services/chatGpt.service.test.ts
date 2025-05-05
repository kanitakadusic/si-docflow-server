import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChatGptService } from '../../src/services/chatGpt.service';

vi.mock('openai', () => {
    return {
        default: vi.fn().mockImplementation(() => ({
            chat: {
                completions: {
                    create: vi.fn(),
                },
            },
        })),
    };
});

describe('ChatGptService', () => {
    let service: ChatGptService;
    let mockCreate: any;

    beforeEach(() => {
        service = new ChatGptService();

        // Izvući instancu mockovane metode
        const openaiInstance = (ChatGptService as any).openAi;
        mockCreate = openaiInstance.chat.completions.create;
    });

    it('should extract text and confidence from GPT response', async () => {
        mockCreate.mockResolvedValue({
            choices: [
                {
                    message: {
                        content: `{"text": "Example text", "confidence": 0.88}`,
                    },
                },
            ],
        });

        const imageBuffer = Buffer.from('fake-image');
        const result = await service.extract(imageBuffer);

        expect(result.text).toBe('Example text');
        expect(result.confidence).toBe(0.88);
        expect(mockCreate).toHaveBeenCalledOnce();
    });

    it('should return default result on invalid JSON', async () => {
        mockCreate.mockResolvedValue({
            choices: [
                {
                    message: {
                        content: `Not a valid JSON`,
                    },
                },
            ],
        });

        const imageBuffer = Buffer.from('fake-image');
        const result = await service.extract(imageBuffer);

        expect(result).toEqual({ text: '', confidence: 0 });
    });

    it('startup and cleanup should do nothing', async () => {
        await expect(service.startup('en')).resolves.toBeUndefined();
        await expect(service.cleanup()).resolves.toBeUndefined();
    });
});
