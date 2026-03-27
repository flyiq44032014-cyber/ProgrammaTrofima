import express from "express";

import * as expressType from "express";

import multer from "multer";

import path from "path";

import fs from "fs";

import type { Photo } from "../services/photoService.js";

import { getAllPhotos, createPhoto, getPhotoById, updatePhoto, deletePhoto } from "../services/photoService.js";



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



            const newPhoto = await createPhoto({

                title,

                filename: file.filename,

                filepath: `/uploads/${file.filename}`

            });



            res.status(201).json(newPhoto);

        } catch (error) {

            res.status(500).json({ error: 'Ошибка создания' });

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



        const deleted = await deletePhoto(id);

        if (!deleted) return res.status(404).json({ error: "Фото не найдено" });

        res.json({ message: "Фото удалено" });

    } catch (error) {

        res.status(500).json({ error: 'Ошибка удаления' });

    }

};