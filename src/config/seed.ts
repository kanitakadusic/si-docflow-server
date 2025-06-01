import { readFile } from 'fs/promises';
import path from 'path';
import type { Model, ModelStatic } from 'sequelize';

import { ROOT } from './env.js';

import {
    AccessRight,
    AiProvider,
    DocumentLayout,
    DocumentType,
    ExternalApiEndpoint,
    ExternalFtpEndpoint,
    LayoutImage,
    LocalStorageFolder,
    ProcessingRule,
    ProcessingRuleDestination,
    sequelize,
} from './db.js';
import { layoutImageSeed } from './layoutImageSeed.js';

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

async function seedLayoutImage(): Promise<void> {
    await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        layoutImageSeed.map((record: any) =>
            LayoutImage.create({
                id: record.id,
                image: Buffer.from(record.image_base64, 'base64'),
                width: record.width,
                height: record.height,
            }),
        ),
    );
    console.log(`- layoutImage seeding done`);
}

sequelize
    .authenticate()
    .then(() => {
        console.log('Successfully connected to the database');
        return sequelize.sync();
    })
    .then(async () => {
        await seedLayoutImage();
        await seed('documentLayout', DocumentLayout);
        await seed('documentType', DocumentType);
        await seed('aiProvider', AiProvider);
        await seed('accessRight', AccessRight);
        await seed('localStorageFolder', LocalStorageFolder);
        await seed('externalApiEndpoint', ExternalApiEndpoint);
        await seed('externalFtpEndpoint', ExternalFtpEndpoint);
        await seed('processingRule', ProcessingRule);
        await seed('processingRuleDestination', ProcessingRuleDestination);

        console.log('Database models successfully synchronized');
    })
    .catch((error) => {
        console.error('Error during database setup:', error);
        process.exit(1);
    });
