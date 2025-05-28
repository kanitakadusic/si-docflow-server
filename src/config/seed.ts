import { readFile } from 'fs/promises';
import path from 'path';
import type { Model, ModelStatic } from 'sequelize';

import { ROOT } from './env.js';

import { AiProvider, DocumentLayout, DocumentType, LayoutImage, sequelize } from './db.js';

async function loadJsonFromFile(filePath: string) {
    const data = await readFile(filePath, 'utf-8');
    return JSON.parse(data);
}

async function writeRecords<T extends Model>(model: ModelStatic<T>, records: object[]): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await Promise.all(records.map((record) => model.create(record as any)));
}

async function seed<T extends Model>(fileName: string, model: ModelStatic<T>) {
    const records = await loadJsonFromFile(path.resolve(ROOT, 'resources', 'data', `${fileName}.data.json`));
    await writeRecords(model, records);
    console.log(`- ${fileName} seeding done`);
}

sequelize
    .authenticate()
    .then(() => sequelize.sync())
    .then(async () => {
        await seed('layoutImage', LayoutImage);
        await seed('documentLayout', DocumentLayout);
        await seed('documentType', DocumentType);
        await seed('aiProvider', AiProvider);

        console.log('Database models synchronized');
    })
    .catch((error) => {
        console.error('Error during database setup:', error);
        process.exit(1);
    });
