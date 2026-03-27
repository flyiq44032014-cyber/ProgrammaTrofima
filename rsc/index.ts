import 'dotenv/config'; // .env подхватится автоматически [web:273][web:276]
import express from 'express';
import photosRouter from "./routes/photos.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Логи, чтобы убедиться, что .env прочитан
console.log('TROFIM_POSTGRES_URL:', process.env.TROFIM_POSTGRES_URL);
console.log('CLOUDINARY_URL:', process.env.CLOUDINARY_URL);

// Создаем приложение
const app = express();

// Включаем JSON-парсинг
app.use(express.json());

// Папка public как статика (index.html, app.js и т.д.) [web:275][web:279]
app.use(express.static(path.join(process.cwd(), 'public')));

// Папка uploads (если вдруг потребуется для статики)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API-роуты
app.use("/api/photos/", photosRouter);

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public/index.html'));
});

// Для разработки ЛОКАЛЬНО — слушаем порт 3000
// (Это НЕ мешает Vercel, там используется export default app) [web:274][web:278]
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Экспортируем Express-приложение (нужно для Vercel) [web:274][web:278]
export default app;