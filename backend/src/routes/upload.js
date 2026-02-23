import express from 'express';
import upload from '../middleware/upload.js';
import * as photoController from '../controllers/photoController.js';

const router = express.Router();

// Subir una foto
router.post('/', upload.single('file'), photoController.uploadPhoto);

export default router;
