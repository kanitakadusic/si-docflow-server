import vision from '@google-cloud/vision';

import { IOcrEngine, IOcrResult } from '../types/ocr.js';

export class GoogleVisionService implements IOcrEngine {
    private readonly client = new vision.ImageAnnotatorClient();

    // Price for document detection, one unit is one image
    // Price is per 1000 units
    private static readonly pricePerUnit = 1.5 / 1000;

    async startup(langCode: string): Promise<void> {}

    async cleanup(): Promise<void> {}

    async extract(image: Buffer): Promise<IOcrResult> {
        const [result] = await this.client.documentTextDetection({ image: { content: image } });

        const annotation = result.fullTextAnnotation;
        if (!annotation) {
            return {
                text: '',
                confidence: 0,
                price: 0
            };
        }

        const pages = annotation.pages ?? [];
        const symbolConfidences: number[] = [];

        for (const page of pages) {
            for (const block of page.blocks ?? []) {
                for (const paragraph of block.paragraphs ?? []) {
                    for (const word of paragraph.words ?? []) {
                        for (const symbol of word.symbols ?? []) {
                            if (symbol.confidence !== undefined) {
                                if (typeof symbol.confidence === 'number') {
                                    symbolConfidences.push(symbol.confidence);
                                }
                            }
                        }
                    }
                }
            }
        }

        const averageConfidence =
            symbolConfidences.length > 0 ? symbolConfidences.reduce((a, b) => a + b, 0) / symbolConfidences.length : 0;

        return {
            text: annotation.text ?? '',
            confidence: Number(averageConfidence.toFixed(2)),
            price: GoogleVisionService.pricePerUnit
        };
    }
}
