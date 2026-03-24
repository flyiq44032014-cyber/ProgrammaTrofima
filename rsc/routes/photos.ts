import  express from 'express'
import * as photoController from "../controllers/photoController.js";

const router = express.Router();

router.get("/",
photoController.getPhotos);
router.post("/",
    photoController.createPhotoHandler);
router.get('/:id', photoController.getPhoto);
router.put('/:id', photoController.updatePhotoHandler);
router.delete('/:id', photoController.deletePhotoHandler);


export default router;
