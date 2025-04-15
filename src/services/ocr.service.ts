// import { DocumentLayout } from '../database/db';
import { extractWithTesseract } from './tesseract.service';

export async function extractData(image: any) {
    // const layouts = await DocumentLayout.findAll();

    // for each rectangle ...
    const fieldName = 'field-1'; // layouts[0].fields[0]...
    const tesseractResult = await extractWithTesseract(image);

    return [
        {
            name: fieldName,
            text: tesseractResult.text,
        },
    ];
}
