import express, { Request, Response, NextFunction } from 'express';
import photosRouter from './routes/photos.js';  // ✅ Абсолютный путь
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Global error handlers ────────────────────────────────────────────────────

process.on('uncaughtException', (err: Error) => {
    console.error('❌ Uncaught Exception:', err.message);
    console.error(err.stack);
    // Keep the process alive so Railway can surface the log
});

process.on('unhandledRejection', (reason: unknown) => {
    console.error('❌ Unhandled Promise Rejection:', reason);
    // Keep the process alive so Railway can surface the log
});

// ─── SQLite initialisation ────────────────────────────────────────────────────

const dbPath = path.join(process.cwd(), 'photos.db');
console.log(`🗄️  Opening database at: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Failed to open SQLite database:', err.message);
    } else {
        console.log('✅ SQLite database opened successfully');
    }
});

db.serialize(() => {
    db.run(
        `CREATE TABLE IF NOT EXISTS photos (
            id       TEXT PRIMARY KEY,
            title    TEXT NOT NULL,
            filename TEXT NOT NULL,
            filepath TEXT NOT NULL
        )`,
        (err) => {
            if (err) {
                console.error('❌ Failed to create photos table:', err.message);
            } else {
                console.log('✅ photos table ready');
            }
        }
    );
});

// ─── Express app ──────────────────────────────────────────────────────────────

const app = express();

app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ✅ ТЕСТ
app.get('/test', (req, res) => res.json({ ok: true }));

// ✅ ПРОВЕРКА ROUTER
console.log('📂 photosRouter:', typeof photosRouter);
app.use("/api/photos/", photosRouter);

app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public/index.html'));
});

// ─── Express error middleware ─────────────────────────────────────────────────

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('❌ Express error:', err.message);
    console.error(err.stack);
    if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error', message: err.message });
    }
});

// ─── Start server ─────────────────────────────────────────────────────────────

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`✅ Server port ${port}`);
});

server.on('error', (err: Error) => {
    console.error('❌ Server error:', err.message);
    console.error(err.stack);
});
