import express from 'express'
import * as photoController from "../controllers/photoController.js";

const router = express.Router();

// ✅ НОВОЕ ИЗМЕНЕНИЕ: Убрал дублирующий POST роут
router.get("/", photoController.getPhotos);
router.post("/", photoController.createPhotoHandler);  // ← Только один POST!

router.get('/:id', photoController.getPhoto);
router.put('/:id', photoController.updatePhotoHandler);
router.delete('/:id', photoController.deletePhotoHandler);

export default router;
