import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const photosDir = path.join(__dirname, '../../uploads');
const photosDbPath = path.join(__dirname, '../../photos.json');

// Inicializar base de datos JSON
const initDb = () => {
  if (!fs.existsSync(photosDbPath)) {
    fs.writeFileSync(photosDbPath, JSON.stringify([], null, 2));
  }
};

const getPhotosDb = () => {
  initDb();
  return JSON.parse(fs.readFileSync(photosDbPath, 'utf-8'));
};

const savePhotosDb = (data) => {
  fs.writeFileSync(photosDbPath, JSON.stringify(data, null, 2));
};

export const uploadPhoto = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    const photo = {
      id: Date.now().toString(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadDate: new Date(),
      url: `/uploads/${req.file.filename}`
    };

    const photos = getPhotosDb();
    photos.push(photo);
    savePhotosDb(photos);

    res.status(201).json({
      success: true,
      message: 'Foto subida exitosamente',
      photo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getAllPhotos = (req, res) => {
  try {
    const photos = getPhotosDb();
    res.json({
      success: true,
      count: photos.length,
      photos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getPhotoById = (req, res) => {
  try {
    const { id } = req.params;
    const photos = getPhotosDb();
    const photo = photos.find(p => p.id === id);

    if (!photo) {
      return res.status(404).json({
        success: false,
        error: 'Foto no encontrada'
      });
    }

    res.json({
      success: true,
      photo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const deletePhoto = (req, res) => {
  try {
    const { id } = req.params;
    const photos = getPhotosDb();
    const photoIndex = photos.findIndex(p => p.id === id);

    if (photoIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Foto no encontrada'
      });
    }

    const photo = photos[photoIndex];
    const filePath = path.join(photosDir, photo.filename);

    // Eliminar archivo si existe
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Eliminar del DB
    photos.splice(photoIndex, 1);
    savePhotosDb(photos);

    res.json({
      success: true,
      message: 'Foto eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
