import OpenAI from 'openai';

import { OPENAI_API_KEY } from '../../config/env.js';

import { IFieldWithCrop, IMappedOcrResultWithCrop, IOcrEngine } from '../../types/ocr.js';
import { mergeCrops } from '../../utils/image.util.js';

export class ChatGptService implements IOcrEngine {
    private static readonly openAi = new OpenAI({ apiKey: OPENAI_API_KEY });

    private static readonly promptTokensPrice = 5.0 / 1e6;
    private static readonly completionTokensPrice = 20.0 / 1e6;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async startup(_: string): Promise<void> {}
    async cleanup(): Promise<void> {}

    async extractFieldsBatch(fieldsWithCrop: IFieldWithCrop[]): Promise<IMappedOcrResultWithCrop[]> {
        const base64Image = (await mergeCrops(fieldsWithCrop)).image.toString('base64');

        const response = await ChatGptService.openAi.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `The image contains ${fieldsWithCrop.length} cropped text fields stacked from top to bottom and separated by green background.
                                   Empty fields are possible. Return a JSON array where each element corresponds to one field, in this format:
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

        let pricePerField = -1;
        if (response.usage) {
            pricePerField =
                (response.usage.prompt_tokens * ChatGptService.promptTokensPrice +
                    response.usage.completion_tokens * ChatGptService.completionTokensPrice) /
                fieldsWithCrop.length;
        }
        const results = fieldsWithCrop.map((fieldWithCrop) => ({
            fieldWithCrop,
            result: { text: '', confidence: 0, price: pricePerField },
        }));

        try {
            const raw = response.choices[0]?.message?.content ?? '';
            const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());

            for (let i = 0; i < fieldsWithCrop.length; i++) {
                results[i].result.text = parsed[i]?.text ?? '';
                results[i].result.confidence = parsed[i]?.confidence ?? 0;
            }

            return results;
        } catch {
            return results;
        }
    }
}
