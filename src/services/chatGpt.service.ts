import OpenAI from 'openai';
import sharp from 'sharp';

import { OPENAI_API_KEY } from '../config/env.js';
import { IOcrEngine, IOcrResult, IMappedOcrResult } from '../types/ocr.js';
import { IField } from '../types/model.js';

export class ChatGptService implements IOcrEngine {
    private static readonly openAi = new OpenAI({ apiKey: OPENAI_API_KEY });

    private static readonly promptTokensPrice = 5.0 / 1e6;
    private static readonly completionTokensPrice = 20.0 / 1e6;

    async startup(langCode: string): Promise<void> {}
    async cleanup(): Promise<void> {}

    async extract(): Promise<IOcrResult> {
        throw new Error('Use extractFieldsBatch instead for ChatGptService');
    }

    async extractFieldsBatch(crops: { field: IField; image: Buffer }[]): Promise<IMappedOcrResult[]> {
        const fieldHeight = 200;

        const totalHeight = crops.length * fieldHeight;
        const maxWidth = Math.max(...await Promise.all(crops.map(c =>
            sharp(c.image).metadata().then(m => m.width ?? 0)
        )));

        const mergedImage = await sharp({
            create: {
                width: maxWidth,
                height: totalHeight,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 },
            }
        }).composite(
            await Promise.all(crops.map(async (crop, idx) => ({
                input: crop.image,
                top: idx * fieldHeight,
                left: 0,
            })))
        ).png().toBuffer();

        const base64Image = mergedImage.toString('base64');

        const response = await ChatGptService.openAi.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `The image contains multiple cropped text fields stacked from top to bottom.
                                    For each field, return a JSON array where each element corresponds to one field, in this format:
                                    {"text": "...", "confidence": number}. Return only the JSON array.`,
                        },
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

        let price = 0;
        if (response.usage) {
            price =
                response.usage.prompt_tokens * ChatGptService.promptTokensPrice +
                response.usage.completion_tokens * ChatGptService.completionTokensPrice;
        }

        const raw = response.choices[0]?.message?.content ?? '';
        try {
            const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());

            return crops.map(({ field }, i) => ({
                field,
                result: {
                    text: parsed[i]?.text ?? '',
                    confidence: parsed[i]?.confidence ?? 0,
                    price: price / crops.length,
                },
            }));
        } catch {
            return crops.map(({ field }) => ({
                field,
                result: {
                    text: '',
                    confidence: 0,
                    price: 0,
                },
            }));
        }
    }
}
