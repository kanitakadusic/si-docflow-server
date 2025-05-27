import vision from '@google-cloud/vision';
import sharp from 'sharp';

import { IMappedOcrResult, IOcrEngine } from '../types/ocr.js';
import { IField } from '../types/model.js';

export class GoogleVisionService implements IOcrEngine {
    private readonly client = new vision.ImageAnnotatorClient();

    private static readonly pricePerUnit = 1.5 / 1000;

    async startup(langCode: string): Promise<void> {}
    async cleanup(): Promise<void> {}

    async extractFieldsBatch(crops: { field: IField; image: Buffer }[]): Promise<IMappedOcrResult[]> {
        const yOffsets: { start: number; end: number; field: IField }[] = [];
        const croppedBuffers: Buffer[] = [];
        let currentYOffset = 0;

        for (const { field, image } of crops) {
            const metadata = await sharp(image).metadata();
            const height = metadata.height ?? 0;

            yOffsets.push({ start: currentYOffset, end: currentYOffset + height, field });
            croppedBuffers.push(image);
            currentYOffset += height;
        }

        const finalImage = await sharp({
            create: {
                width: Math.max(
                    ...(await Promise.all(
                        croppedBuffers.map((b) =>
                            sharp(b)
                                .metadata()
                                .then((m) => m.width ?? 0),
                        ),
                    )),
                ),
                height: currentYOffset,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 },
            },
        })
            .composite(croppedBuffers.map((b, i) => ({ input: b, top: yOffsets[i].start, left: 0 })))
            .png()
            .toBuffer();

        const [result] = await this.client.documentTextDetection({ image: { content: finalImage } });
        const annotation = result.fullTextAnnotation;

        if (!annotation) {
            return crops.map(({ field }) => ({
                field,
                result: { text: '', confidence: 0, price: GoogleVisionService.pricePerUnit },
            }));
        }

        const symbolConfidences: number[] = [];
        const fieldTextMap = new Map<IField, string[]>();

        for (const { field } of yOffsets) {
            fieldTextMap.set(field, []);
        }

        const blocks = annotation.pages?.flatMap((p) => p.blocks ?? []) ?? [];
        for (const block of blocks) {
            for (const paragraph of block.paragraphs ?? []) {
                for (const word of paragraph.words ?? []) {
                    const wordText = word.symbols?.map((s) => s.text).join('') ?? '';
                    const wordY = word.boundingBox?.vertices?.[0]?.y ?? 0;
                    const conf = word.confidence;
                    if (typeof conf === 'number') {
                        symbolConfidences.push(conf);
                    }
                    const match = yOffsets.find((offset) => wordY >= offset.start && wordY <= offset.end);
                    if (match) {
                        fieldTextMap.get(match.field)?.push(wordText);
                    }
                }
            }
        }

        const averageConfidence =
            symbolConfidences.length > 0 ? symbolConfidences.reduce((a, b) => a + b, 0) / symbolConfidences.length : 0;

        return crops.map(({ field }) => ({
            field,
            result: {
                text: fieldTextMap.get(field)?.join(' ') ?? '',
                confidence: Number(averageConfidence.toFixed(2)),
                price: GoogleVisionService.pricePerUnit / crops.length,
            },
        }));
    }
}
