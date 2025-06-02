import vision from '@google-cloud/vision';

import { IFieldWithCrop, IMappedOcrResultWithCrop, IOcrEngine } from '../../types/ocr.js';
import { mergeCrops } from '../../utils/image.util.js';

export class GoogleVisionService implements IOcrEngine {
    private readonly client = new vision.ImageAnnotatorClient();

    private static readonly pricePerUnit = 1.5 / 1000;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async startup(_: string): Promise<void> {}
    async cleanup(): Promise<void> {}

    async extractFieldsBatch(fieldsWithCrop: IFieldWithCrop[]): Promise<IMappedOcrResultWithCrop[]> {
        const { image: finalImage, yOffsets } = await mergeCrops(fieldsWithCrop);

        const [{ fullTextAnnotation }] = await this.client.documentTextDetection({ image: { content: finalImage } });

        const pricePerField = GoogleVisionService.pricePerUnit / fieldsWithCrop.length;
        const results = fieldsWithCrop.map((fieldWithCrop) => ({
            fieldWithCrop,
            result: { text: '', confidence: 0, price: pricePerField },
        }));

        const confidenceSums = new Array(results.length).fill(0);
        const confidenceCounts = new Array(results.length).fill(0);

        if (fullTextAnnotation && fullTextAnnotation.pages) {
            for (const { blocks } of fullTextAnnotation.pages) {
                if (!blocks) {
                    break;
                }
                for (const { paragraphs } of blocks) {
                    if (!paragraphs) {
                        break;
                    }
                    for (const { words } of paragraphs) {
                        if (!words) {
                            break;
                        }
                        for (const { boundingBox, symbols, confidence } of words) {
                            if (
                                !symbols ||
                                !boundingBox ||
                                !boundingBox.vertices ||
                                !boundingBox.vertices[0] ||
                                !boundingBox.vertices[0].y
                            ) {
                                break;
                            }
                            const text: string = symbols.map((symbol) => symbol.text).join('');
                            const topLeftY: number = boundingBox.vertices[0].y;

                            const fieldMatchIndex = yOffsets.findIndex(
                                (yOffset) => topLeftY >= yOffset.start && topLeftY <= yOffset.end,
                            );
                            if (fieldMatchIndex !== -1) {
                                if (results[fieldMatchIndex].result.text.length > 0) {
                                    results[fieldMatchIndex].result.text += ' ';
                                }
                                results[fieldMatchIndex].result.text += text;

                                confidenceSums[fieldMatchIndex] += confidence || 0;
                                confidenceCounts[fieldMatchIndex]++;
                            }
                        }
                    }
                }
            }
        }

        for (let i = 0; i < results.length; i++) {
            results[i].result.confidence = confidenceCounts[i] > 0 ? confidenceSums[i] / confidenceCounts[i] : 0;
        }

        return results;
    }
}
