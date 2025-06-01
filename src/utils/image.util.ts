import sharp from 'sharp';
// debug ->
// import { join } from 'path';
// import fs from 'fs';
//
// import { ROOT } from '../config/env.js';
//
// import { generateTimestampFilename } from './path.util.js';
// <- debug
import { IField } from '../types/model.js';
import { IFieldWithCrop } from '../types/ocr.js';
import { IMergedCrops, IStartEnd } from '../types/util.js';

// debug ->
// function sanitizeFieldName(str: string): string {
//     return str
//         .normalize('NFD')
//         .replace(/[\u0300-\u036f]/g, '')
//         .replace(/[^a-zA-Z0-9]/g, '_')
//         .replace(/_+/g, '_')
//         .replace(/^_|_$/g, '')
//         .toLowerCase();
// }
// <- debug

export async function cropFields(image: Buffer, fields: IField[]): Promise<IFieldWithCrop[]> {
    // debug ->
    // const outputDir = join(ROOT, 'debug', 'ocr_outputs', generateTimestampFilename());
    // fs.mkdirSync(outputDir, { recursive: true });
    // fs.writeFileSync(join(outputDir, 'DOCUMENT.jpeg'), image);
    // <- debug

    return Promise.all(
        fields.map(async (field): Promise<IFieldWithCrop> => {
            const crop = await sharp(image)
                .extract({
                    left: Math.round(field.upper_left[0]),
                    top: Math.round(field.upper_left[1]),
                    width: Math.round(field.lower_right[0] - field.upper_left[0]),
                    height: Math.round(field.lower_right[1] - field.upper_left[1]),
                })
                .jpeg()
                .toBuffer();

            // debug ->
            // const outputPath = join(outputDir, `${sanitizeFieldName(field.name)}.jpeg`);
            // fs.writeFileSync(outputPath, crop);
            // <- debug

            return { ...field, crop };
        }),
    );
}

export async function mergeCrops(fieldsWithCrop: IFieldWithCrop[]): Promise<IMergedCrops> {
    const yOffsets: IStartEnd[] = [];
    let currentYOffset = 0;
    let maxWidth = 0;

    for (const fieldWithCrop of fieldsWithCrop) {
        const metadata = await sharp(fieldWithCrop.crop).metadata();

        const width = metadata?.width ?? 0;
        if (width > maxWidth) {
            maxWidth = width;
        }

        const height = metadata?.height ?? 0;
        yOffsets.push({ start: currentYOffset, end: (currentYOffset += height) });
        currentYOffset += 5;
    }

    const finalImage = await sharp({
        create: {
            width: maxWidth,
            height: currentYOffset,
            channels: 4,
            background: { r: 0, g: 255, b: 0, alpha: 1 },
        },
    })
        .composite(
            fieldsWithCrop.map((fieldWithCrop, index) => ({
                input: fieldWithCrop.crop,
                top: yOffsets[index].start,
                left: 0,
            })),
        )
        .jpeg()
        .toBuffer();

    // debug ->
    // const outputDir = join(ROOT, 'debug', 'ocr_outputs', 'mergedCrops');
    // fs.mkdirSync(outputDir, { recursive: true });
    // fs.writeFileSync(join(outputDir, `${generateTimestampFilename()}.jpeg`), finalImage);
    // <- debug

    return { image: finalImage, yOffsets };
}
