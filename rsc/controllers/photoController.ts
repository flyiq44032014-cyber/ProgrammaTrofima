import express from "express";
import type { Request, Response, RequestHandler } from "express"; // ✅ лучше так, чем expressType

import multer from "multer";
import path from "path";
import fs from "fs";

import type { Photo } from "../services/photoService.js";
import {
    getAllPhotos,
    createPhoto,
    getPhotoById,
    updatePhoto,
    deletePhoto,
} from "../services/photoService.js";

// ✅ uploads папка
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Только изображения!'));
        }
    }
});

// ✅ GET все
export const getPhotos = async (req: Request, res: Response) => {
    console.log("📸 getPhotos: вызов GET /");

    try {
        const photos = await getAllPhotos();
        console.log("📸 getPhotos: ответ =", photos);
        res.json(photos);
    } catch (error) {
        console.error('💥 getPhotos error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

// ✅ POST с файлом
export const createPhotoHandler: RequestHandler[] = [
    upload.single("photo"),
    async (req: Request, res: Response) => {
        console.log("📸 createPhotoHandler: raw body =", req.body);
        console.log("📸 createPhotoHandler: raw file =", (req as any).file);

        try {
            const { title } = req.body;
            const file = (req as any).file;

            if (!title || !file) {
                console.log("❌ createPhotoHandler: title or file missing");
                return res.status(400).json({ error: "Название и фото обязательны" });
            }

            const newPhoto = await createPhoto({
                title,
                filename: file.filename,
                filepath: `/uploads/${file.filename}`,
            });

            console.log("✅ createPhotoHandler: создано фото =", newPhoto);
            res.status(201).json(newPhoto);
        } catch (error) {
            console.error('💥 createPhotoHandler error:', error);
            res.status(500).json({ error: 'Ошибка создания' });
        }
    }
];

// ✅ GET /:id
export const getPhoto = async (req: Request, res: Response) => {
    console.log("📸 getPhoto: idParam =", req.params.id);

    try {
        const idParam = req.params.id;
        if (typeof idParam !== 'string') {
            return res.status(400).json({ error: "ID должен быть строкой" });
        }

        const id: string = idParam;

        const photo = await getPhotoById(id);
        if (!photo) return res.status(404).json({ error: "Фото не найдено" });

        console.log("📸 getPhoto: найдено =", photo);
        res.json(photo);
    } catch (error) {
        console.error('💥 getPhoto error:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
};

// ✅ PUT /:id — только title
export const updatePhotoHandler = async (req: Request, res: Response) => {
    console.log("📸 updatePhotoHandler: idParam =", req.params.id);
    console.log("📸 updatePhotoHandler: body =", req.body);

    try {
        const idParam = req.params.id;
        if (typeof idParam !== 'string') {
            return res.status(400).json({ error: "ID должен быть строкой" });
        }

        const id: string = idParam;
        const { title } = req.body;

        if (!title) {
            console.log("❌ updatePhotoHandler: title missing");
            return res.status(400).json({ error: "title обязателен" });
        }

        const updated = await updatePhoto(id, { title });
        if (!updated) return res.status(404).json({ error: "Фото не найдено" });

        console.log("✅ updatePhotoHandler: обновлено =", updated);
        res.json(updated);
    } catch (error) {
        console.error('💥 updatePhotoHandler error:', error);
        res.status(500).json({ error: 'Ошибка обновления' });
    }
};

// ✅ DELETE /:id
export const deletePhotoHandler = async (req: Request, res: Response) => {
    console.log("📸 deletePhotoHandler: idParam =", req.params.id);

    try {
        const idParam = req.params.id;
        if (typeof idParam !== 'string') {
            return res.status(400).json({ error: "ID неверный" });
        }

        const id: string = idParam;

        const deleted = await deletePhoto(id);
        if (!deleted) return res.status(404).json({ error: "Фото не найдено" });

        console.log("✅ deletePhotoHandler: удалено id =", id);
        res.json({ message: "Фото удалено" });
    } catch (error) {
        console.error('💥 deletePhotoHandler error:', error);
        res.status(500).json({ error: 'Ошибка удаления' });
    }
};