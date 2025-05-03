import vision from '@google-cloud/vision';
import { IOcrResult } from './ocr.service.js';

export class GoogleVisionService {
    private client = new vision.ImageAnnotatorClient();

    async extract(image: Buffer): Promise<IOcrResult> {
        const [result] = await this.client.documentTextDetection({ image: { content: image } });

        const annotation = result.fullTextAnnotation;
        if (!annotation) {
            return {
                text: '',
                confidence: 0,
            };
        }

        const pages = annotation.pages ?? [];
        let symbolConfidences: number[] = [];

        for (const page of pages) {
            for (const block of page.blocks ?? []) {
                for (const paragraph of block.paragraphs ?? []) {
                    for (const word of paragraph.words ?? []) {
                        for (const symbol of word.symbols ?? []) {
                            if (symbol.confidence !== undefined ) {
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
            symbolConfidences.length > 0
                ? symbolConfidences.reduce((a, b) => a + b, 0) / symbolConfidences.length
                : 0;

        return {
            text: annotation.text ?? '',
            confidence: Number(averageConfidence.toFixed(3)), // zaokružiš na 3 decimale
        };
    }
}
