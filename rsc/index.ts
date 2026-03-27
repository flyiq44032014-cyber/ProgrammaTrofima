
import "dotenv/config";
import express from "express";
import type { NextFunction } from "express";
import fs from "node:fs";
import path from "path";

import photosRouter from "./routes/photos.js";

const app = express();

const port = 3000;

app.use(express.json());

app.use("/api/photos", photosRouter);

app.use((err: unknown, req: express.Request, res: express.Response, _next: NextFunction) => {
    console.error(err);
    if (res.headersSent) return;
    res.status(500).type("text").send("Internal server error");
});

if (!process.env.VERCEL) {
    app.use(express.static(path.join(process.cwd(), "public")));

    app.get("/", (req, res, next) => {
        const indexPath = path.resolve(process.cwd(), "public", "index.html");
        if (!fs.existsSync(indexPath)) {
            console.error("Missing public/index.html at", indexPath);
            return res.status(500).type("text").send("Missing public/index.html");
        }
        res.sendFile(indexPath, err => {
            if (err) next(err);
        });
    });

    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
}

export default app;
