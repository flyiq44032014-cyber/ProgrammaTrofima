import express from 'express';
import photosRouter from "./routes/photos.js";
import path from 'path';
import fs from 'fs';  // ✅ НОВОЕ: для проверки файлов
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ process.cwd() = корень проекта (где package.json)
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use("/api/photos/", photosRouter);

// ✅ КОРНЕВОЙ МАРШРУТ — для фронтенда
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public/index.html'));
});

// ✅ НОВОЕ ИЗМЕНЕНИЕ: Логи для отладки на хостинге
console.log('🚀 Запуск сервера...');
console.log('📁 process.cwd():', process.cwd());
console.log('📁 public path:', path.join(process.cwd(), 'public'));
console.log('📁 public exists?', fs.existsSync(path.join(process.cwd(), 'public')));
console.log('📁 index.html?', fs.existsSync(path.join(process.cwd(), 'public/index.html')));
console.log('📁 dist exists?', fs.existsSync(path.join(process.cwd(), 'dist')));
console.log('📁 uploads path:', path.join(process.cwd(), 'uploads'));

// ✅ ДИНАМИЧЕСКИЙ ПОРТ для хостингов
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`✅ Server on port ${port}`);
    console.log('🌐 API: http://localhost:${port}/api/photos/');
    console.log('📄 Serving index.html:', path.join(process.cwd(), 'public/index.html'));
});
