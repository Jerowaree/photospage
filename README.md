# Aldryck — Photography Portfolio

Portfolio profesional del fotógrafo **Aldryck**. Sitio minimalista y editorial construido con **Astro 4** + **Tailwind CSS** (frontend) y **Express + MongoDB + Cloudinary** (backend).

---

## Stack técnico

| Capa          | Tecnología                                     |
|---------------|------------------------------------------------|
| Frontend      | Astro 4 · React · Tailwind CSS · Framer Motion |
| Tipografía    | Cormorant Garamond (logo) · Inter (cuerpo)     |
| Transiciones  | Astro View Transitions                         |
| Backend       | Express + TypeScript · Zod (validación)        |
| Base de datos | MongoDB (Mongoose)                             |
| Almacenamiento| Cloudinary (imágenes)                          |
| Iconos        | Lucide React                                   |

---

## Estructura del proyecto

```
aldryck-photospage/
├── frontend/                      # Astro app
│   ├── src/
│   │   ├── components/
│   │   │   ├── gallery/
│   │   │   │   ├── GalleryGrid.tsx     # Grid masonry + Framer Motion
│   │   │   │   └── PhotoLightbox.tsx   # Lightbox con teclado
│   │   │   └── admin/
│   │   │       └── UploadPanel.tsx     # Panel de subida con drag&drop
│   │   ├── layouts/
│   │   │   └── Layout.astro            # Layout con View Transitions
│   │   ├── lib/
│   │   │   └── api.ts                  # Cliente de API tipado
│   │   ├── pages/
│   │   │   ├── index.astro             # Homepage editorial
│   │   │   ├── gallery/
│   │   │   │   ├── index.astro         # Todas las fotos
│   │   │   │   └── [slug].astro        # Por categoría
│   │   │   └── admin/
│   │   │       └── index.astro         # Panel admin
│   │   ├── styles/
│   │   │   └── globals.css             # Layers Tailwind + custom classes
│   │   └── types/
│   │       └── index.ts                # Tipos compartidos
│   ├── astro.config.mjs
│   ├── tailwind.config.mjs
│   └── tsconfig.json
│
├── backend/                       # Express API
│   ├── src/
│   │   ├── controllers/
│   │   │   └── photoController.ts  # CRUD + upload con validación Zod
│   │   ├── lib/
│   │   │   ├── cloudinary.ts       # Upload + delete en Cloudinary
│   │   │   └── db.ts               # Conexión MongoDB
│   │   ├── middleware/
│   │   │   ├── auth.ts             # Token admin
│   │   │   └── upload.ts           # Multer (memory storage)
│   │   ├── models/
│   │   │   └── Photo.ts            # Mongoose schema
│   │   ├── routes/
│   │   │   ├── photos.ts           # GET / GET:id / PATCH / DELETE
│   │   │   └── upload.ts           # POST /upload
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── server.ts               # Entry point
│   ├── .env.example
│   └── tsconfig.json
│
└── package.json                   # Workspace root (npm workspaces)
```

---

## Instalación

```bash
# 1. Dependencias
npm install

# 2. Variables de entorno
cp backend/.env.example  backend/.env
cp frontend/.env.example frontend/.env
```

Edita `backend/.env` con tus credenciales:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/aldryck
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
ADMIN_TOKEN=un_token_seguro
```

```env
# frontend/.env
PUBLIC_API_URL=http://localhost:5000/api
```

## Desarrollo

```bash
npm run dev
```

| Servicio     | URL                           |
|--------------|-------------------------------|
| Frontend     | http://localhost:3000         |
| API          | http://localhost:5000/api     |
| Admin panel  | http://localhost:3000/admin   |

## API endpoints

| Método   | Ruta                    | Auth   | Descripción               |
|----------|-------------------------|--------|---------------------------|
| `GET`    | `/api/photos`           | —      | Listar fotos (paginado)   |
| `GET`    | `/api/photos/categories`| —      | Categorías con conteo     |
| `GET`    | `/api/photos/:id`       | —      | Foto individual           |
| `POST`   | `/api/upload`           | ✅ Token | Subir foto a Cloudinary   |
| `PATCH`  | `/api/photos/:id`       | ✅ Token | Actualizar metadatos      |
| `DELETE` | `/api/photos/:id`       | ✅ Token | Eliminar foto + Cloudinary|

### Subir una foto (ejemplo con curl)

```bash
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer TU_ADMIN_TOKEN" \
  -F "file=@imagen.jpg" \
  -F "title=Golden Hour" \
  -F "category=landscape" \
  -F "featured=true"
```

## Diseño

- **Tipografía**: Cormorant Garamond (peso 300–600, con cursivas) para el logo y títulos; Inter para el cuerpo.
- **Paleta**: Escala `stone` de Tailwind — mínima, sin colores de acento.
- **Grid**: Masonry CSS `columns` para respetar el ratio original de cada foto.
- **Lightbox**: Navegación con teclado (`←` `→` `Esc`), zoom suave.
- **View Transitions**: Transición `slide-from-right` entre páginas de categoría.

## Licencia

MIT

Una aplicación web moderna para subir, compartir y gestionar fotos. Construida con **Astro** (frontend) y **Express** (backend).

## Características

- ✅ Subida de fotos mediante drag & drop
- ✅ Validación de tipos de archivo (JPEG, PNG, GIF, WebP)
- ✅ Límite de tamaño de archivo (10MB máximo)
- ✅ Galería responsive
- ✅ Eliminación de fotos
- ✅ API REST completa
- ✅ CORS habilitado para desarrollo

## Estructura del proyecto

```
photospage/
├── frontend/              # Aplicación Astro
│   ├── src/
│   │   ├── pages/        # Páginas de Astro
│   │   ├── components/   # Componentes React
│   │   ├── layouts/      # Layouts
│   │   └── utils/        # Utilidades
│   ├── astro.config.mjs
│   └── package.json
├── backend/               # Servidor Express
│   ├── src/
│   │   ├── routes/       # Rutas API
│   │   ├── controllers/  # Controladores
│   │   ├── middleware/   # Middleware de carga
│   │   └── server.js     # Servidor principal
│   ├── uploads/          # Carpeta de fotos subidas
│   └── package.json
├── package.json          # Workspace root
└── README.md
```

## Requisitos

- Node.js 16 o superior
- npm o yarn

## Instalación

1. **Clonar el repositorio:**
```bash
git clone <repository-url>
cd photospage
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**

Backend (`.env` en carpeta `backend/`):
```env
PORT=5000
FRONTEND_URL=http://localhost:3000
```

Frontend (`.env` en carpeta `frontend/`):
```env
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:5000/api
```

## Desarrollo

Ejecutar ambos servidores en paralelo:

```bash
npm run dev
```

Esto iniciará:
- **Frontend Astro**: http://localhost:3000
- **Backend Express**: http://localhost:5000

## Compilación y producción

```bash
npm run build
npm start
```

## API Endpoints

### Subir foto
```
POST /api/upload
Content-Type: multipart/form-data

Body: { file: <archivo> }
Response: { success: true, photo: {...} }
```

### Obtener todas las fotos
```
GET /api/photos
Response: { success: true, photos: [...], count: number }
```

### Obtener foto por ID
```
GET /api/photos/:id
Response: { success: true, photo: {...} }
```

### Eliminar foto
```
DELETE /api/photos/:id
Response: { success: true, message: "..." }
```

### Health Check
```
GET /api/health
Response: { status: "ok", timestamp: "..." }
```

## Tecnologías

### Frontend
- **Astro**: Framework moderno para construcción de sitios
- **React**: Componentes interactivos
- **CSS**: Estilos modernos y responsivos

### Backend
- **Express**: Framework minimalista para Node.js
- **Multer**: Manejo de carga de archivos
- **UUID**: Generación de IDs únicos
- **CORS**: Manejo de solicitudes cross-origin

## Características de seguridad

- ✅ Validación de tipos de archivo
- ✅ Límite de tamaño de archivo
- ✅ Nombres de archivo únicos (previene conflictos)
- ✅ CORS configurado
- ✅ Error handling robusto

## Desarrollo futuro

- Autenticación de usuarios
- Base de datos (MongoDB, PostgreSQL)
- Compresión de imágenes
- Miniaturas automáticas
- Búsqueda y filtrado
- Opciones de privacidad
- Sistema de comentarios

## Licencia

MIT