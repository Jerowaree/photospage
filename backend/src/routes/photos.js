import express from 'express';
import * as photoController from '../controllers/photoController.js';

const router = express.Router();

// Obtener todas las fotos
router.get('/', photoController.getAllPhotos);

// Obtener foto por ID
router.get('/:id', photoController.getPhotoById);

// Eliminar foto
router.delete('/:id', photoController.deletePhoto);

export default router;
