import * as express from "express";
import type { Photo } from "../services/photoService.js";
import { getAllPhotos, createPhoto } from "../services/photoService.js";

export const getPhotos = (req:express.Request,res: express.Response) => {
    const photos = getAllPhotos();
    res.json(photos);
};

export const createPhotoHandler = (req: express.Request,res: express.Response) => {
    const { title, filename, filepath } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Поле title обязательно" });
    }

    const newPhoto = createPhoto({
        title,
        filename,
        filepath,
    });

    res.status(201).json(newPhoto);
};
import {getPhotoById, updatePhoto, deletePhoto}
    from "../services/photoService.js";

export const getPhoto = (req: express.Request,res: express.Response) => {
    const id =req.params.id;
    if (typeof id !== 'string'){
        return res.status(404).json({error: "id дожно быть стракой"})
    }
    const photo = getPhotoById(id);

    if (!photo){
        return
        res.status(404).json({error: "Фото не найдено"})

    }
    res.json(photo);
};
export const updatePhotoHandler = (
    req: express.Request,
    res: express.Response,
) => {
    const id = req.params.id;

    if (typeof id !== "string") {
        return res.status(404).json({ error: "id должно быть строкой" });
    }

    const { title, filename, filepath } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Поле title обязательно" });
    }

    const updatedPhoto = updatePhoto(id, { title, filename, filepath });

    if (!updatedPhoto) {
        return res.status(404).json({ error: "Фото не найдено" });
    }

    return res.json(updatedPhoto);
    export const deletePhotoHandler  = (
        req: express.Request,
        res: express.Response,
    ) => {
        const id = req.params.id;
        if (typeof id !== "string") {
            return res.status(404).json({ error: "id должно быть строкой" });
        }
        const deleted = deletePhoto(id);

        if (!deleted) {
            return res.status(404).json({ error: "Фото не найдено" });
        }
        res.json({message: "Фото удалено"});
    };



