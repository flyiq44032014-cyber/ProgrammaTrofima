import express from "express";
import * as expressType from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { getAllPhotos, createPhoto, getPhotoById, updatePhoto, deletePhoto } from "../services/photoService.js";

const upload = multer({
    storage: multer.memoryStorage(),
    // Vercel serverless payload limit is typically ~4.5 MB; stay below it
    limits: { fileSize: 4 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
            return;
        }
        cb(new Error("Только изображения!"));
    }
});

function loadCloudinaryFromEnv(): void {
    try {
        cloudinary.config(true);
    } catch (err) {
        console.error("Cloudinary config failed (check CLOUDINARY_URL)", err);
    }
}

loadCloudinaryFromEnv();

function cloudinaryConfigured(): boolean {
    const cfg = cloudinary.config() as { cloud_name?: string; api_key?: string; api_secret?: string };
    return Boolean(cfg.cloud_name && cfg.api_key && cfg.api_secret);
}



// ✅ GET все — async

export const getPhotos = async (req: express.Request, res: express.Response) => {

    try {

        const photos = await getAllPhotos();

        res.json(photos);

    } catch (error) {

        res.status(500).json({ error: 'Ошибка сервера' });

    }

};



// ✅ POST с файлом — async middleware

export const createPhotoHandler: expressType.RequestHandler[] = [

    upload.single("photo"),

    async (req: expressType.Request, res: express.Response) => {

        try {

            const { title } = req.body;

            const file = (req as any).file;



            if (!title || !file) {

                return res.status(400).json({ error: "Название и фото обязательны" });

            }

            if (!cloudinaryConfigured()) {
                return res.status(503).json({
                    error: "Cloudinary не настроен",
                    details: "Добавьте CLOUDINARY_URL в Environment Variables проекта на Vercel (формат cloudinary://api_key:api_secret@cloud_name)."
                });
            }

            const uploaded = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "programmatrofima" },
                    (error, result) => {
                        if (error || !result) {
                            reject(error ?? new Error("Cloudinary upload failed"));
                            return;
                        }
                        resolve({
                            secure_url: result.secure_url,
                            public_id: result.public_id
                        });
                    }
                );
                stream.end(file.buffer);
            });

            const newPhoto = await createPhoto({
                title,
                filename: file.originalname,
                filepath: uploaded.secure_url,
                cloudinary_public_id: uploaded.public_id
            });



            res.status(201).json(newPhoto);

        } catch (error) {

            const message = error instanceof Error ? error.message : String(error);
            console.error("POST /api/photos:", error);
            res.status(500).json({ error: "Ошибка создания", details: message });

        }

    }

];



// ✅ GET /:id — async

export const getPhoto = async (req: express.Request, res: express.Response) => {

    try {

        const id = req.params.id as string;

        const photo = await getPhotoById(id);

        if (!photo) return res.status(404).json({ error: "Фото не найдено" });

        res.json(photo);

    } catch (error) {

        res.status(500).json({ error: 'Ошибка сервера' });

    }

};



// ✅ PUT /:id — async

export const updatePhotoHandler = async (req: express.Request, res: express.Response) => {

    try {

        const id = req.params.id as string;

        const { title } = req.body;



        if (!title || typeof id !== "string") {

            return res.status(400).json({ error: "ID и title обязательны" });

        }



        const updated = await updatePhoto(id, { title });

        if (!updated) return res.status(404).json({ error: "Фото не найдено" });

        res.json(updated);

    } catch (error) {

        res.status(500).json({ error: 'Ошибка обновления' });

    }

};



// ✅ DELETE /:id — async

export const deletePhotoHandler = async (req: express.Request, res: express.Response) => {

    try {

        const id = req.params.id as string;

        if (typeof id !== "string") {

            return res.status(400).json({ error: "ID неверный" });

        }



        const photo = await getPhotoById(id);
        if (!photo) return res.status(404).json({ error: "Фото не найдено" });

        if (photo.cloudinary_public_id) {
            await cloudinary.uploader.destroy(photo.cloudinary_public_id, {
                resource_type: "image"
            });
        }

        const deleted = await deletePhoto(id);

        if (!deleted) return res.status(404).json({ error: "Фото не найдено" });

        res.json({ message: "Фото удалено" });

    } catch (error) {

        res.status(500).json({ error: 'Ошибка удаления' });

    }

};
