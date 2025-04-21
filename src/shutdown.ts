import { TesseractService } from './services/tesseract.service.js';

export async function shutdown(): Promise<void> {
    try {
        console.log('\n💨 Shutting down server...');

        await TesseractService.terminateWorker();
        console.log('\t✔️ Worker terminated');

        console.log('🚧 Server shutdown complete!\n');
    } catch (error) {
        console.error('\n🛑 Error during server shutdown\n', error);
    }
}
