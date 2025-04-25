import { IOcrResult } from './ocr.service.js';
import { OpenAI } from 'openai';

export class ChatGptOcrService {
    private readonly openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    async extract(image: Buffer): Promise<IOcrResult> {
        const base64 = image.toString('base64');

        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Extract text from this image:' },
                        {
                            type: 'image_url',
                            image_url: { url: `data:image/png;base64,${base64}` },
                        },
                    ],
                },
            ],
            max_tokens: 1024,
        });

        return {
            text: response.choices?.[0]?.message?.content || '',
            confidence: 0.8
        };
    }
}
