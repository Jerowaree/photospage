import { Router } from 'express';
import { upload } from '../middleware/upload';
import { requireAdminToken } from '../middleware/auth';
import { uploadPhoto } from '../controllers/photoController';

const router = Router();

// Protected: only admin can upload
router.post('/', requireAdminToken, upload.single('file'), uploadPhoto);

export default router;
