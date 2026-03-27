
import 'dotenv/config';
import express from 'express';
import type { NextFunction } from 'express';
import fs from 'node:fs';

import photosRouter from "./routes/photos.js";

import path from 'path';



const app = express();

const port = 3000;



// ✅ process.cwd() = корень проекта (где package.json)

app.use(express.json());

app.use(express.static(path.join(process.cwd(), 'public')));



app.use("/api/photos", photosRouter);



app.get('/', (req, res, next) => {
    const indexPath = path.resolve(process.cwd(), 'public', 'index.html');
    if (!fs.existsSync(indexPath)) {
        console.error("Missing public/index.html at", indexPath);
        return res.status(500).type("text").send("Missing public/index.html (deployment bundle)");
    }
    res.sendFile(indexPath, err => {
        if (err) next(err);
    });
});

app.use((err: unknown, req: express.Request, res: express.Response, _next: NextFunction) => {
    console.error(err);
    if (res.headersSent) return;
    res.status(500).type("text").send("Internal server error");
});

if (!process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}

export default app;


