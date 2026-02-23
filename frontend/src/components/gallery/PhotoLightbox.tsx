import { useEffect, useCallback } from 'react';
import type { Photo } from '../../types';

interface Props {
    photo: Photo;
    photos: Photo[];
    onClose: () => void;
    onNavigate: (photo: Photo) => void;
}

export default function PhotoLightbox({ photo, photos, onClose, onNavigate }: Props) {
    const currentIndex = photos.findIndex((p) => p.id === photo.id);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < photos.length - 1;

    const prev = useCallback(() => {
        if (hasPrev) onNavigate(photos[currentIndex - 1]);
    }, [currentIndex, hasPrev, onNavigate, photos]);

    const next = useCallback(() => {
        if (hasNext) onNavigate(photos[currentIndex + 1]);
    }, [currentIndex, hasNext, onNavigate, photos]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        };
        document.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [onClose, prev, next]);

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-[100] bg-stone-950/95 flex items-center justify-center
                       animate-fade-in"
            onClick={onClose}
        >
            {/* Content */}
            <div
                className="relative max-w-[90vw] max-h-[90vh] flex flex-col animate-fade-up"
                style={{ animationDuration: '350ms', animationFillMode: 'both' }}
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={photo.url}
                    alt={photo.title}
                    className="max-w-[88vw] max-h-[82vh] w-auto h-auto object-contain"
                />

                {/* Caption */}
                <div className="mt-4 flex items-center justify-between text-white/60 text-xs">
                    <div>
                        <p className="font-['Cormorant_Garamond'] text-white text-lg font-light">
                            {photo.title}
                        </p>
                        {photo.description && (
                            <p className="text-white/50 text-xs mt-1 max-w-md">{photo.description}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="uppercase tracking-widest">{photo.category}</span>
                        <a
                            href={photo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/40 hover:text-white transition-colors"
                            title="Open original"
                        >
                            {/* ExternalLink icon */}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                                strokeLinejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            {/* Close */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors
                           bg-transparent border-0 cursor-pointer p-2"
                aria-label="Close"
            >
                {/* X icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>

            {/* Counter */}
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/30 text-xs tracking-widest">
                {currentIndex + 1} / {photos.length}
            </span>

            {/* Prev */}
            {hasPrev && (
                <button
                    onClick={(e) => { e.stopPropagation(); prev(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white
                               bg-transparent border-0 cursor-pointer p-3 transition-colors"
                    aria-label="Previous photo"
                >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1" strokeLinecap="round"
                        strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
            )}

            {/* Next */}
            {hasNext && (
                <button
                    onClick={(e) => { e.stopPropagation(); next(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white
                               bg-transparent border-0 cursor-pointer p-3 transition-colors"
                    aria-label="Next photo"
                >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1" strokeLinecap="round"
                        strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            )}
        </div>
    );
}
