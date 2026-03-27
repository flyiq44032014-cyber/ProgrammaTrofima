import express from 'express';
import photosRouter from "./routes/photos.js";  // ← Может не импортироваться!
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ ЛОГИ ДО app.use
console.log('📂 cwd:', process.cwd());
console.log('📂 routes/photos.js:', fs.existsSync('./routes/photos.js'));

app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ✅ ТЕСТ РОУТА — ДОБАВЬ
app.get('/test', (req, res) => res.json({ status: 'OK', port: process.env.PORT }));

// ✅ ПРОВЕРКА ИМПОРТА ROUTES
try {
    app.use("/api/photos/", photosRouter);
    console.log('✅ photosRouter подключён');
} catch (e) {
    console.error('❌ Ошибка photosRouter:', e);
    app.get('/api/photos/', (req, res) => res.json({ error: 'Router failed', details: (e as Error).message }));
}

app.get('/', (req, res) => {
    const indexPath = path.join(process.cwd(), 'public/index.html');
    console.log('Serving:', indexPath, fs.existsSync(indexPath));
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).json({ error: 'index.html not found' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`✅ Server on port ${port}`);
});
