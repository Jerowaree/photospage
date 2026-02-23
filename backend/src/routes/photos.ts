import { Router } from 'express';
import { getPhotos, getPhotoById, updatePhoto, deletePhoto, getCategories } from '../controllers/photoController';
import { requireAdminToken } from '../middleware/auth';

const router = Router();

// Public
router.get('/', getPhotos);
router.get('/categories', getCategories);
router.get('/:id', getPhotoById);

// Protected (admin)
router.patch('/:id', requireAdminToken, updatePhoto);
router.delete('/:id', requireAdminToken, deletePhoto);

export default router;
