import tesseract, { ImageLike, Page } from 'tesseract.js';

export async function extractWithTesseract(image: ImageLike): Promise<Page> {
    const result = await tesseract.recognize(image, 'eng');
    return result.data;
}
