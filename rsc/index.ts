import express from 'express';
import type { Request, Response, NextFunction } from 'express';  // ✅ ИМПОРТ ТИПОВ
import photosRouter from './routes/photos.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// статика
const publicDir = path.join(process.cwd(), 'public');
const uploadDir = path.join(process.cwd(), 'uploads');

app.use(express.json());
app.use(express.static(publicDir));
app.use('/uploads', express.static(uploadDir));

// ✅ ТЕСТ РОУТЫ — ПРАВИЛЬНЫЕ ТИПЫ
app.get('/health', (req: Request, res: Response) => res.json({ status: 'OK' }));
app.get('/test', (req: Request, res: Response) => res.json({ ok: true }));

app.use("/api/photos/", photosRouter);

app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

// ✅ ГЛОБАЛЬНЫЕ ОБРАБОТЧИКИ ОШИБОК
process.on('uncaughtException', (err: any) => {
    console.error('💥 FATAL ERROR:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
    console.error('💥 PROMISE REJECTED:', reason);
    process.exit(1);
});

// ✅ EXPRESS ERROR HANDLER — ПРАВИЛЬНЫЕ ТИПЫ
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('💥 EXPRESS ERROR:', err);
    res.status(500).json({ error: 'Internal error', details: err.message });
});

// ✅ ПОРТ — number тип
const port = (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000) as number;

app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server listening on 0.0.0.0:${port}`);

    // создаём uploads папку ТОЛЬКО при старте сервера, не при импорте!
    try {
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
            console.log('📁 Created uploads dir:', uploadDir);
        }
    } catch (err) {
        console.error('📁 Failed to create uploads dir:', err);
    }
});