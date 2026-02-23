/** Tipo base de una foto (refleja el modelo Prisma). */
export interface IPhoto {
    id: string;
    title: string;
    description: string;
    category: string;
    tags: string[];
    url: string;
    thumbnailUrl: string;
    publicId: string;
    width: number;
    height: number;
    aspectRatio: number;
    featured: boolean;
    uploadedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type UploadPhotoBody = Pick<IPhoto, 'title' | 'category'> &
    Partial<Pick<IPhoto, 'description' | 'featured'>> & {
        tags?: string;
    };
