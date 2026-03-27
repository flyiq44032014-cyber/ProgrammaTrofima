
import 'dotenv/config';
import express from 'express';

import photosRouter from "./routes/photos.js";

import path from 'path';

import { fileURLToPath } from 'url';



const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);



const app = express();

const port = 3000;



// ✅ process.cwd() = корень проекта (где package.json)

app.use(express.json());

app.use(express.static(path.join(process.cwd(), 'public')));



app.use("/api/photos", photosRouter);



app.get('/', (req, res) => {

    res.sendFile(path.join(process.cwd(), 'public/index.html'));

});

if (!process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}

export default app;


