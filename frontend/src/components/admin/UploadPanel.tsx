import { useState, useRef, useCallback, useEffect } from 'react';
import { uploadPhoto, getPhotos, deletePhoto } from '../../lib/api';
import type { Photo } from '../../types';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface FormState {
    title: string;
    category: string;
    description: string;
    tags: string;
    featured: boolean;
}

const DEFAULT_FORM: FormState = {
    title: '',
    category: '',
    description: '',
    tags: '',
    featured: false,
};

const CATEGORIES = ['portrait', 'landscape', 'editorial', 'street', 'travel', 'nature'];

const CATEGORY_LABELS: Record<string, string> = {
    portrait: 'Retrato',
    landscape: 'Paisaje',
    editorial: 'Editorial',
    street: 'Calle',
    travel: 'Viaje',
    nature: 'Naturaleza',
};

export default function UploadPanel() {
    const [form, setForm] = useState<FormState>(DEFAULT_FORM);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [status, setStatus] = useState<UploadStatus>('idle');
    const [message, setMessage] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loadingPhotos, setLoadingPhotos] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const loadPhotos = useCallback(async () => {
        setLoadingPhotos(true);
        try {
            const res = await getPhotos({ limit: 20 });
            setPhotos(res.data.photos);
        } catch {
            // ignore
        } finally {
            setLoadingPhotos(false);
        }
    }, []);

    // Load photos on mount
    useEffect(() => { loadPhotos(); }, [loadPhotos]);
    const handleFile = (f: File) => {
        if (!f.type.startsWith('image/')) {
            setMessage('Solo se aceptan imágenes.');
            setStatus('error');
            return;
        }
        setFile(f);
        setPreview(URL.createObjectURL(f));
        setStatus('idle');
        setMessage('');
        // Pre-fill title from file name
        setForm((prev) => ({
            ...prev,
            title: prev.title || f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
        }));
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) handleFile(dropped);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) { setMessage('Selecciona una imagen.'); setStatus('error'); return; }
        if (!form.title) { setMessage('El título es obligatorio.'); setStatus('error'); return; }
        if (!form.category) { setMessage('La categoría es obligatoria.'); setStatus('error'); return; }

        setStatus('uploading');
        setMessage('');

        try {
            await uploadPhoto(file, {
                title: form.title,
                category: form.category,
                description: form.description || undefined,
                tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
                featured: form.featured,
            });
            setStatus('success');
            setMessage('¡Foto publicada exitosamente!');
            setForm(DEFAULT_FORM);
            setFile(null);
            setPreview(null);
            await loadPhotos();
        } catch (err) {
            setStatus('error');
            setMessage((err as Error).message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar esta foto permanentemente?')) return;
        try {
            await deletePhoto(id);
            setPhotos((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
            alert((err as Error).message);
        }
    };

    return (
        <div className="space-y-16">

            {/* ── Upload form ──────────────────────────────────────── */}
            <div className="grid md:grid-cols-2 gap-10">

                {/* Drop zone */}
                <div>
                    <p className="text-xs tracking-widest uppercase text-stone-400 mb-4">Archivo de imagen</p>
                    <div
                        className={[
                            'border border-dashed rounded-none aspect-[4/3] flex flex-col items-center justify-center',
                            'cursor-pointer transition-colors duration-300',
                            isDragging ? 'border-stone-900 bg-stone-100' : 'border-stone-200 hover:border-stone-400',
                        ].join(' ')}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => fileRef.current?.click()}
                    >
                        {preview ? (
                            <img src={preview} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center text-stone-400 space-y-3 pointer-events-none">
                                {/* ImagePlus icon */}
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="1" strokeLinecap="round"
                                    strokeLinejoin="round" className="mx-auto">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                    <line x1="16" y1="5" x2="16" y2="11" />
                                    <line x1="13" y1="8" x2="19" y2="8" />
                                </svg>
                                <p className="text-xs tracking-widest uppercase">Suelta la imagen aquí</p>
                                <p className="text-xs text-stone-300">o haz clic para buscar</p>
                            </div>
                        )}
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                        />
                    </div>
                    {file && (
                        <p className="mt-2 text-xs text-stone-400">
                            {file.name} — {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                    )}
                </div>

                {/* Metadata form */}
                <form onSubmit={handleSubmit} className="space-y-5 flex flex-col justify-between">
                    <div className="space-y-5">
                        <p className="text-xs tracking-widest uppercase text-stone-400">Metadatos</p>

                        {/* Title */}
                        <div>
                            <label className="block text-xs text-stone-500 mb-1 tracking-widest uppercase">
                                Título *
                            </label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="Sin título"
                                className="w-full border-b border-stone-200 bg-transparent py-2 text-sm
                           text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-900
                           transition-colors duration-200"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-xs text-stone-500 mb-1 tracking-widest uppercase">
                                Categoría *
                            </label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full border-b border-stone-200 bg-transparent py-2 text-sm
                           text-stone-900 focus:outline-none focus:border-stone-900 transition-colors
                           appearance-none cursor-pointer"
                            >
                                <option value="">Seleccionar categoría…</option>
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>
                                ))}
                            </select>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs text-stone-500 mb-1 tracking-widest uppercase">
                                Descripción
                            </label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={2}
                                placeholder="Descripción opcional…"
                                className="w-full border-b border-stone-200 bg-transparent py-2 text-sm
                           text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-900
                           transition-colors resize-none"
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-xs text-stone-500 mb-1 tracking-widest uppercase">
                                Etiquetas (separadas por coma)
                            </label>
                            <input
                                type="text"
                                value={form.tags}
                                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                placeholder="naturaleza, luz, analógico"
                                className="w-full border-b border-stone-200 bg-transparent py-2 text-sm
                           text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-900
                           transition-colors"
                            />
                        </div>

                        {/* Featured */}
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={form.featured}
                                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                                className="sr-only"
                            />
                            <span
                                className={[
                                    'w-4 h-4 border flex items-center justify-center transition-colors',
                                    form.featured ? 'border-stone-900 bg-stone-900' : 'border-stone-300',
                                ].join(' ')}
                            >
                                {form.featured && <span className="block w-2 h-2 bg-white" />}
                            </span>
                            <span className="text-xs tracking-widest uppercase text-stone-500 group-hover:text-stone-900
                               transition-colors">
                                Destacar en la página principal
                            </span>
                        </label>
                    </div>

                    {/* Submit */}
                    <div>
                        {status === 'success' && (
                            <p className="flex items-center gap-2 text-xs text-emerald-600 mb-4 animate-fade-in">
                                {/* CheckCircle2 */}
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                {message}
                            </p>
                        )}
                        {status === 'error' && (
                            <p className="flex items-center gap-2 text-xs text-red-500 mb-4 animate-fade-in">
                                {/* AlertCircle */}
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'uploading'}
                            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {/* Upload icon */}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="16 16 12 12 8 16" />
                                <line x1="12" y1="12" x2="12" y2="21" />
                                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                            </svg>
                            {status === 'uploading' ? 'Subiendo…' : 'Publicar foto'}
                        </button>
                    </div>
                </form>
            </div>

            {/* ── Uploaded photos list ──────────────────────────────── */}
            <div>
                <div className="flex items-center justify-between mb-8">
                    <p className="text-xs tracking-widest uppercase text-stone-400">
                        Subidas recientes
                    </p>
                    <button onClick={loadPhotos} className="nav-link text-xs" type="button">
                        {loadingPhotos ? 'Cargando…' : 'Actualizar'}
                    </button>
                </div>

                {photos.length === 0 ? (
                    <p className="text-stone-300 text-sm font-light">Sin fotos aún.</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {photos.map((photo) => (
                            <div key={photo.id} className="group relative overflow-hidden bg-stone-100 aspect-square">
                                <img
                                    src={photo.thumbnailUrl}
                                    alt={photo.title}
                                    className="w-full h-full object-cover transition-transform duration-500
                             group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/50
                                transition-colors duration-300 flex flex-col items-center
                                justify-center gap-2 opacity-0 group-hover:opacity-100">
                                    <p className="text-white text-xs text-center px-2 leading-tight line-clamp-2">
                                        {photo.title}
                                    </p>
                                    <button
                                        onClick={() => handleDelete(photo.id)}
                                        className="text-red-300 hover:text-red-200 bg-transparent border-0 cursor-pointer
                               flex items-center gap-1 text-xs"
                                    >
                                        {/* X icon */}
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
