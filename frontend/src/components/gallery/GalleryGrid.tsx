import { useState, useCallback } from 'react';
import type { Photo } from '../../types';
import PhotoLightbox from './PhotoLightbox';

interface Props {
    photos: Photo[];
}

export default function GalleryGrid({ photos }: Props) {
    const [selected, setSelected] = useState<Photo | null>(null);

    const handleOpen = useCallback((p: Photo) => setSelected(p), []);
    const handleClose = useCallback(() => setSelected(null), []);

    if (photos.length === 0) {
        return (
            <div className="py-32 text-center">
                <p className="font-['Cormorant_Garamond'] text-4xl font-light text-stone-300 mb-4">
                    Sin fotos aún
                </p>
            </div>
        );
    }

    return (
        <>
            {/* Masonry-style grid using CSS columns */}
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3">
                {photos.map((photo, i) => (
                    <div
                        key={photo.id}
                        className="break-inside-avoid group relative overflow-hidden bg-stone-100
                                   cursor-pointer animate-fade-up"
                        style={{
                            aspectRatio: photo.aspectRatio ? `${photo.width}/${photo.height}` : '3/4',
                            animationDelay: `${i * 50}ms`,
                            animationFillMode: 'both',
                        }}
                        onClick={() => handleOpen(photo)}
                    >
                        {/* Lazy-loaded thumbnail */}
                        <img
                            src={photo.thumbnailUrl}
                            alt={photo.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover transition-transform duration-700
                                       ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105"
                            style={{ display: 'block' }}
                        />

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/25
                                        transition-colors duration-500 flex items-end p-5 pointer-events-none">
                            <div className="translate-y-3 group-hover:translate-y-0 opacity-0
                                            group-hover:opacity-100 transition-all duration-300">
                                <p className="text-white font-['Cormorant_Garamond'] text-lg font-light leading-tight">
                                    {photo.title}
                                </p>
                                {photo.category && (
                                    <p className="text-white/70 text-xs tracking-widest uppercase mt-1">
                                        {photo.category}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Featured badge */}
                        {photo.featured && (
                            <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-white opacity-80" />
                        )}
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {selected && (
                <PhotoLightbox
                    photo={selected}
                    photos={photos}
                    onClose={handleClose}
                    onNavigate={setSelected}
                />
            )}
        </>
    );
}
