import express from 'express';

import { PORT } from './config/env.js';
import { swaggerSpec, swaggerUi } from './config/swagger.js';

import documentRoutes from './routes/document.routes.js';
import documentTypeRoutes from './routes/documentType.routes.js';
import documentLayoutRoutes from './routes/documentLayout.routes.js';

const app = express();

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/document', documentRoutes);
app.use('/document', documentTypeRoutes);
app.use('/document', documentLayoutRoutes);

// debug (processing rule: externalApiEndpoint) ->
app.post('/externalApiEndpoint', (req: express.Request, res: express.Response) => {
    try {
        if (!req.body || typeof req.body !== 'object') {
            console.log('/externalApiEndpoint: 400');
            res.sendStatus(400);
        } else {
            console.log('/externalApiEndpoint: 200');
            console.log(JSON.stringify(req.body, null, 2).slice(0, 350) + ' (...)');
            res.sendStatus(200);
        }
    } catch (_) {
        console.log('/externalApiEndpoint: 500');
        res.sendStatus(500);
    }
});
// <- debug (processing rule: externalApiEndpoint)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API docs available at http://localhost:${PORT}/api-docs`);
});
