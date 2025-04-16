import tesseract, { ImageLike, Page } from 'tesseract.js';

export class TesseractService {
    async extract(image: ImageLike): Promise<Page> {
        const result = await tesseract.recognize(image, 'eng');
        return result.data;
    }
}
