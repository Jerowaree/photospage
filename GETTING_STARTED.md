# Guía de inicio rápido - PhotosPage

## ¿Primeros pasos?

Sigue estos pasos para tener la aplicación ejecutándose en tu máquina local.

### 1. Preparar el ambiente

```bash
# Instalar todas las dependencias (frontend y backend)
npm install

# Crear archivos .env necesarios
cp .env.example .env
cd backend && cp .env.example .env && cd ..
cd frontend && cp .env.example .env && cd ..
```

### 2. Ejecutar en desarrollo

Desde la carpeta raíz del proyecto:

```bash
npm run dev
```

Esto abrirá automáticamente:
- 🌐 Frontend: http://localhost:3000
- ⚙️ Backend API: http://localhost:5000

### 3. Uso de la aplicación

1. Abre http://localhost:3000 en tu navegador
2. Arrastra y suelta fotos en el área de carga
3. O haz clic en "Seleccionar archivo"
4. ¡Tus fotos aparecerán en la galería!

## Estructura de carpetas

```
frontend/          - Aplicación Astro + React
├── src/
│   ├── pages/    - Página principal
│   ├── components/- UploadForm y PhotoGallery
│   ├── layouts/  - Layout base
│   └── utils/    - Funciones de API

backend/          - Servidor Express
├── src/
│   ├── routes/   - Definición de rutas API
│   ├── controllers/- Lógica de carga de fotos
│   ├── middleware/- Configuración de Multer
│   └── server.js - Punto de entrada
└── uploads/      - Carpeta de almacenamiento de fotos
```

## Variables de entorno

### Backend (`backend/.env`)
```env
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env`)
```env
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:5000/api
```

## Comandos útiles

### En la raíz del proyecto:
```bash
npm run dev      # Ejecutar frontend y backend en paralelo
npm run build    # Compilar frontend y backend
npm start        # Iniciar servidor de producción
```

### En la carpeta `frontend/`:
```bash
npm run dev      # Iniciar Astro en modo desarrollo
npm run build    # Compilar para producción
npm run preview  # Previsualizar build
```

### En la carpeta `backend/`:
```bash
npm run dev      # Iniciar con nodemon (auto-reload)
npm run start    # Iniciar servidor
```

## Troubleshooting

### ❌ "EADDRINUSE: address already in use :::5000"
El puerto 5000 ya está en uso. Cambia el puerto en `backend/.env`:
```env
PORT=5001
```

### ❌ "CORS error" o "Cannot POST /api/upload"
Asegúrate de que ambos servidores estén ejecutándose:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### ❌ Las fotos no se guardan
Verifica que la carpeta `backend/uploads/` existe y tiene permisos de escritura.

## Próximos pasos

1. **Explorar el código** - Revisa los componentes en `frontend/src/components/`
2. **Personalizar estilos** - Modifica los archivos `.css`
3. **Agregar funcionalidades** - Añade nuevas rutas en `backend/src/routes/`
4. **Base de datos** - Cuando estés listo, añade MongoDB o PostgreSQL

## Contacto y soporte

¿Problemas? Revisa el [README.md](README.md) para más información.

---

¡Diviértete subiendo fotos! 📸
