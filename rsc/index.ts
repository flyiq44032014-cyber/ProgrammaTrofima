import express from 'express';
import photosRouter from './routes/photos.js';  // ✅ Абсолютный путь
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`✅ Server port ${port}`);
});
