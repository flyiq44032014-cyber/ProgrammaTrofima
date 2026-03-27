import express from "express";
import * as expressType from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import path from "path";
import fs from "fs";
import type { Photo } from "../services/photoService.js";
import { getAllPhotos, createPhoto, getPhotoById, updatePhoto, deletePhoto } from "../services/photoService.js";

cloudinary.v2.config();

console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('TROFIM_POSTGRES_URL:', process.env.TROFIM_POSTGRES_URL);

// ✅ multer: в памяти, а не на диске
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ GET все — async
export const getPhotos = async (req: express.Request, res: express.Response) => {
    try {
        const photos = await getAllPhotos();
        res.json(photos);
    } catch (error) {
        res.status(500).json({ error: "Ошибка сервера" });
    }
};

// ✅ POST /api/photos — с файлом в Cloudinary
export const createPhotoHandler: expressType.RequestHandler[] = [
    upload.single("photo"),
    async (req: expressType.Request, res: express.Response) => {
        try {
            const { title } = req.body;
            const file = (req as any).file as Express.Multer.File;

            if (!title) {
                return res.status(400).json({ error: "Название обязательно" });
            }
            if (!file || !file.buffer) {
                return res.status(400).json({ error: "Файл обязателен" });
            }

            // 👇 Загружаем файл в Cloudinary через upload_stream
            const uploadStream = cloudinary.v2.uploader.upload_stream(
                {
                    folder: "programmatrofima_photos",
                    public_id: `photo_${Date.now()}`,
                    resource_type: "auto",
                },
                async (error, result: cloudinary.UploadApiResponse | undefined) => {
                    if (error || !result) {
                        console.error("Cloudinary upload error:", error);
                        return res.status(500).json({ error: "Ошибка загрузки в Cloudinary" });
                    }

                    try {
                        const newPhoto = await createPhoto({
                            title,
                            filename: result.original_filename,
                            filepath: result.secure_url,
                        });

                        res.status(201).json(newPhoto);
                    } catch (dbError) {
                        res.status(500).json({ error: "Ошибка при сохранении в БД" });
                    }
                }
            );

            uploadStream.end(file.buffer);
        } catch (error) {
            res.status(500).json({ error: "Ошибка сервера при создании фото" });
        }
    },
];

// ✅ GET /:id — async
export const getPhoto = async (req: express.Request, res: express.Response) => {
    try {
        const id = req.params.id as string;
        const photo = await getPhotoById(id);

        if (!photo) {
            return res.status(404).json({ error: "Фото не найдено" });
        }

        res.json(photo);
    } catch (error) {
        res.status(500).json({ error: "Ошибка сервера" });
    }
};

// ✅ PUT /api/photos/:id — обновить title
export const updatePhotoHandler = async (req: express.Request, res: express.Response) => {
    try {
        const id = req.params.id as string;
        const { title } = req.body;

        if (!id || !title) {
            return res.status(400).json({ error: "ID и title обязательны" });
        }

        const updated = await updatePhoto(id, { title });

        if (!updated) {
            return res.status(404).json({ error: "Фото не найдено" });
        }

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: "Ошибка обновления" });
    }
};

// ✅ DELETE /api/photos/:id
export const deletePhotoHandler = async (req: express.Request, res: express.Response) => {
    try {
        const id = req.params.id as string;

        if (!id) {
            return res.status(400).json({ error: "ID обязателен" });
        }

        const deleted = await deletePhoto(id);

        if (!deleted) {
            return res.status(404).json({ error: "Фото не найдено" });
        }

        res.json({ message: "Фото удалено" });
    } catch (error) {
        res.status(500).json({ error: "Ошибка удаления" });
    }
};