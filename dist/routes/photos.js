import express from 'express';
import * as photoController from "../controllers/photoController.js";
const router = express.Router();
router.get("/", photoController.getPhotos);
router.post("/", photoController.createPhotoHandler);
export default router;
//# sourceMappingURL=photos.js.map