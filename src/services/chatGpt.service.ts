import OpenAI from 'openai';
import sharp from 'sharp';

import { OPENAI_API_KEY } from '../config/env.js';
import { IOcrEngine, IOcrResult, IMappedOcrResult} from '../types/ocr.js';
import { IField } from '../types/model.js';

export class ChatGptService implements IOcrEngine {
    private static readonly openAi = new OpenAI({ apiKey: OPENAI_API_KEY });

    private static readonly promptTokensPrice = 5.0 / 1e6;
    private static readonly completionTokensPrice = 20.0 / 1e6;

    async startup(langCode: string): Promise<void> {}

    async cleanup(): Promise<void> {}

    async extract(image: Buffer): Promise<IOcrResult> {
        const base64Image = image.toString('base64');

        const response = await ChatGptService.openAi.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Extract the text and return confidence as JSON in this format: {"text": "...", "confidence": ...}',
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
            const json = JSON.parse(raw.replace(/```json|```/g, '').trim());
            return {
                text: json.text ?? '',
                confidence: json.confidence ?? 0,
                price,
            };
        } catch {
            return {
                text: '',
                confidence: 0,
                price: 0,
            };
        }
    }

    async extractFieldsBatch(image: Buffer, fields: IField[]): Promise<IMappedOcrResult[]> {
        const crops: { field: IField; image: Buffer }[] = [];

        for (const field of fields) {
            const cropped = await sharp(image)
                .extract({
                    left: Math.round(field.upper_left[0]),
                    top: Math.round(field.upper_left[1]),
                    width: Math.round(field.lower_right[0] - field.upper_left[0]),
                    height: Math.round(field.lower_right[1] - field.upper_left[1]),
                })
                .png()
                .toBuffer();
            crops.push({ field, image: cropped });
        }

        const mergedImage = await sharp({
            create: {
                width: Math.max(...crops.map(c => c.image.length)),
                height: crops.length * 200,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 },
            },
        }).composite(
            await Promise.all(
                crops.map(async (crop, idx) => ({
                    input: crop.image,
                    top: idx * 200,
                    left: 0,
                }))
            )
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
                            text: 'Za svaku sliku (redoslijedom od vrha prema dnu), vrati JSON: {"field_index": n, "text": "...", "confidence": ...}',
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

            return fields.map((field, i) => ({
                field,
                result: {
                    text: parsed[i]?.text ?? '',
                    confidence: parsed[i]?.confidence ?? 0,
                    price: price / fields.length,
                },
            }));
        } catch {
            return fields.map(field => ({
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
