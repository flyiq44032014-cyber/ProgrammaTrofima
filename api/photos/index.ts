// api/photos/index.ts
import express from 'express';
import * as photoController from '../../rsc/controllers/photoController.js';
import type { Request, Response } from 'express';

const app = express();
app.use(express.json());

app.get('/', photoController.getPhotos);
app.post('/', photoController.createPhotoHandler);
app.get('/:id', photoController.getPhoto);
app.put('/:id', photoController.updatePhotoHandler);
app.delete('/:id', photoController.deletePhotoHandler);

export default app.requestHandler;