import vision from '@google-cloud/vision';
import { IOcrResult } from './ocr.service.js';

export class GoogleVisionService {
    private client = new vision.ImageAnnotatorClient();

    async extract(image: Buffer): Promise<IOcrResult> {
        const [result] = await this.client.textDetection({ image: { content: image } });

        const annotation = result.fullTextAnnotation;
        if (!annotation) {
            return {
                text: '',
                confidence: 0,
            };
        }

        return {
            text: annotation.text ?? '',
            confidence: 0.9, // Vision API ne daje confidence za cijeli tekst, pa stavljamo fiksno
        };
    }
}
