import React, { useState, useEffect } from 'react';
import './PhotoGallery.css';

export default function PhotoGallery({ refreshTrigger }) {
    const [photos, setPhotos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPhotos = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:5000/api/photos');
            if (!response.ok) {
                throw new Error('Error al obtener fotos');
            }
            const data = await response.json();
            setPhotos(data.photos || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPhotos();
    }, [refreshTrigger]);

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta foto?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/photos/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Error al eliminar la foto');
            }

            setPhotos(photos.filter(photo => photo.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    if (isLoading) {
        return <div className="loading">Cargando fotos...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    if (photos.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">📁</div>
                <p>No hay fotos subidas todavía</p>
                <p className="hint">¡Sube tu primera foto!</p>
            </div>
        );
    }

    return (
        <div className="gallery-container">
            <h2>Galería de fotos ({photos.length})</h2>
            <div className="gallery-grid">
                {photos.map((photo) => (
                    <div key={photo.id} className="photo-card">
                        <img
                            src={`http://localhost:5000${photo.url}`}
                            alt={photo.originalName}
                            className="photo-image"
                        />
                        <div className="photo-info">
                            <p className="photo-name">{photo.originalName}</p>
                            <p className="photo-size">
                                {(photo.size / 1024).toFixed(2)} KB
                            </p>
                            <p className="photo-date">
                                {new Date(photo.uploadDate).toLocaleDateString('es-ES')}
                            </p>
                        </div>
                        <button
                            className="delete-btn"
                            onClick={() => handleDelete(photo.id)}
                            title="Eliminar foto"
                        >
                            🗑️
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
