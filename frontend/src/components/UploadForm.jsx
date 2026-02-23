import React, { useState, useCallback } from 'react';
import './UploadForm.css';

export default function UploadForm({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = useCallback(async (file) => {
    setError(null);
    setSuccess(null);

    // Validaciones
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de archivo no permitido. Solo: JPEG, PNG, GIF, WebP');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo es demasiado grande (máximo 10MB)');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al subir la foto');
      }

      const data = await response.json();
      setSuccess('¡Foto subida exitosamente!');
      onUploadSuccess?.(data.photo);

      // Limpiar el input
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [onUploadSuccess]);

  return (
    <div className="upload-container">
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="drop-content">
          <div className="drop-icon">📸</div>
          <h3>Arrastra fotos aquí</h3>
          <p>o haz clic para seleccionar</p>
          <p className="file-info">Máximo 10MB - JPEG, PNG, GIF, WebP</p>
        </div>
        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          disabled={isLoading}
          style={{ display: 'none' }}
        />
      </div>

      <label htmlFor="file-input" className="file-label">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          {isLoading ? 'Subiendo...' : 'Seleccionar archivo'}
        </button>
      </label>

      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}
    </div>
  );
}
