import { sequelize } from './database/db.js';
import { DocumentPreprocessorService } from './services/documentPreprocessor.service.js';
import { TesseractService } from './services/tesseract.service.js';

export async function bootstrap(): Promise<void> {
    try {
        console.log('\n💨 Initializing server...');

        await sequelize.authenticate();
        console.log('\t✔️ Connected to the database');

        await DocumentPreprocessorService.initOpenCV();
        console.log('\t✔️ OpenCV loaded');

        await TesseractService.createWorker();
        console.log('\t✔️ Worker created');

        console.log('🚀 Server initialization complete!\n');
    } catch (error) {
        console.error('\n🛑 Error during server initialization\n', error);
        process.exit(1);
    }
}
