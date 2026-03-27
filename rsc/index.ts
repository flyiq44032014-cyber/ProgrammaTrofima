import 'dotenv/config';
import express from 'express';
import photosRouter from './routes/photos.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Логи ENV для дебага
console.log('TROFIM_POSTGRES_URL:', process.env.TROFIM_POSTGRES_URL);
console.log('CLOUDINARY_URL:', process.env.CLOUDINARY_URL);

const app = express();

// Включен JSON-парсинг
app.use(express.json());

// Vercel сам раздает /public как CDN — .static() игнорится, но можно оставить ради dev
// В проде — лучше не полагаться на express.static в Vercel
app.use(express.static(path.join(process.cwd(), 'public')));

// API-роутер
app.use('/api/photos/', photosRouter);

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public/index.html'));
});

// Для локального запуска (Vercel воспримет export default app;)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app;