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
import { getPhotoById, updatePhoto, deletePhoto } from "../services/photoService.js";
export const getPhoto = (req, res) => {
    const id = req.params.id;
    if (typeof id !== 'string') {
        return res.status(404).json({ error: "id дожно быть стракой" });
    }
    const photo = getPhotoById(id);
    if (!photo) {
        return;
        res.status(404).json({ error: "Фото не найдено" });
    }
    res.json(photo);
};
export const updatePhotoHandler = (req, res) => {
    const id = req.params.id;
    if (typeof id !== "string") {
        return res.status(404).json({ error: "id дожно быть стракой" });
    }
    const { title, filename, filepath } = req.body;
    if (!title) {
        return res.status(400).json({ error: "Поле title обязательно" });
    }
    const updatePhoto = updatePhoto(id, { title, filename, filepath });
    if (!updatePhoto) {
        return res.status(404).json({ error: "Фото не найдено" });
    }
};
//# sourceMappingURL=photoController.js.map