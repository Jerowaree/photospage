import type { Photo, ApiResponse, PaginatedPhotos, Category } from '../types';

const API_URL = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:5000/api';

async function fetcher<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
        headers: { 'Content-Type': 'application/json', ...init?.headers },
        ...init,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message ?? 'API Error');
    }
    return res.json() as Promise<T>;
}

/* ─── Photos ──────────────────────────────────────────────── */

export function getPhotos(params?: {
    category?: string;
    page?: number;
    limit?: number;
    featured?: boolean;
}) {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.featured) query.set('featured', 'true');
    const qs = query.toString() ? `?${query}` : '';
    return fetcher<ApiResponse<PaginatedPhotos>>(`/photos${qs}`);
}

export function getPhotoById(id: string) {
    return fetcher<ApiResponse<Photo>>(`/photos/${id}`);
}

export function deletePhoto(id: string) {
    return fetcher<ApiResponse<null>>(`/photos/${id}`, { method: 'DELETE' });
}

export function updatePhoto(id: string, data: Partial<Pick<Photo, 'title' | 'description' | 'category' | 'tags' | 'featured'>>) {
    return fetcher<ApiResponse<Photo>>(`/photos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

/* ─── Categories ──────────────────────────────────────────── */

export function getCategories() {
    return fetcher<ApiResponse<Category[]>>('/categories');
}

/* ─── Upload ──────────────────────────────────────────────── */

export async function uploadPhoto(
    file: File,
    metadata: { title: string; category: string; description?: string; tags?: string[]; featured?: boolean }
): Promise<ApiResponse<Photo>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', metadata.title);
    formData.append('category', metadata.category);
    if (metadata.description) formData.append('description', metadata.description);
    if (metadata.tags?.length) formData.append('tags', metadata.tags.join(','));
    if (metadata.featured !== undefined) formData.append('featured', String(metadata.featured));

    const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message ?? 'Upload failed');
    }
    return res.json();
}
