import * as express from "express";
import { getAllPhotos, createPhoto } from "../services/photoService.js";
export const getPhotos = (req, res) => {
    const photos = getAllPhotos();
    res.json(photos);
};
export const createPhotoHandler = (req, res) => {
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
//# sourceMappingURL=photoController.js.map