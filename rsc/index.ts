import express from 'express';

import type { Request, Response, NextFunction } from 'express';

import photosRouter from './routes/photos.js';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Тестовые роуты
app.get('/health', (req: Request, res: Response) => res.json({ status: 'OK' }));
app.get('/test', (req: Request, res: Response) => res.json({ ok: true }));

app.use('/api/photos/', photosRouter);

app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public/index.html'));
});

// Глобальные обработчики ошибок
process.on('uncaughtException', (err: any) => {
    console.error('💥 FATAL ERROR:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
    console.error('💥 PROMISE REJECTED:', reason);
    process.exit(1);
});

// Express error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('💥 EXPRESS ERROR:', err);
    res.status(500).json({ error: 'Internal error', details: err.message });
});

// ✅ PORT — берём из env или по умолчанию 3000
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`✅ Server listening on port ${port}`);
});