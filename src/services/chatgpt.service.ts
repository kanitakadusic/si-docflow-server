import OpenAI from 'openai';
import { IOcrResult } from './ocr.service.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export class ChatGptOcrService {
    async extract(image: Buffer): Promise<IOcrResult> {
        const base64Image = image.toString('base64');

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Extract the text and return confidence as JSON in this format: {"text": "...", "confidence": ...}' },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/png;base64,${base64Image}`,
                            },
                        },
                    ],
                },
            ],
        });

        const raw = response.choices[0]?.message?.content ?? '';
        try {
            const json = JSON.parse(raw.replace(/```json|```/g, '').trim());
            return {
                text: json.text ?? '',
                confidence: json.confidence ?? 0,
            };
        } catch {
            return { text: '', confidence: 0 };
        }
    }
}
