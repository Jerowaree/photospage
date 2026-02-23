export interface Photo {
    id: string;          // Prisma cuid (ex: mongoDB _id era string)
    title: string;
    description?: string;
    category: string;
    tags: string[];
    url: string;
    thumbnailUrl: string;
    publicId: string;
    width: number;
    height: number;
    aspectRatio: number;
    uploadedAt: string;
    featured: boolean;
}

export interface Category {
    slug: string;
    label: string;
    count: number;
    coverUrl?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedPhotos {
    photos: Photo[];
    total: number;
    page: number;
    pages: number;
}
