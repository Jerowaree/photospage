import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    api_key: process.env.CLOUDINARY_API_KEY ?? '',
    api_secret: process.env.CLOUDINARY_API_SECRET ?? '',
    secure: true,
});

export { cloudinary };

/**
 * Upload a file buffer to Cloudinary under the "aldryck" folder,
 * returning the secure URL and public ID.
 */
export async function uploadBuffer(
    buffer: Buffer,
    options: {
        folder?: string;
        publicId?: string;
        transformation?: Record<string, unknown>[];
    } = {}
): Promise<{ url: string; thumbnailUrl: string; publicId: string; width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: options.folder ?? 'aldryck',
                public_id: options.publicId,
                transformation: options.transformation,
                resource_type: 'image',
                quality: 'auto:best',
                fetch_format: 'auto',
            },
            (error, result) => {
                if (error || !result) return reject(error ?? new Error('Upload failed'));
                resolve({
                    url: result.secure_url,
                    thumbnailUrl: cloudinary.url(result.public_id, {
                        width: 800,
                        height: 800,
                        crop: 'limit',
                        quality: 'auto:good',
                        fetch_format: 'auto',
                    }),
                    publicId: result.public_id,
                    width: result.width,
                    height: result.height,
                });
            }
        );
        uploadStream.end(buffer);
    });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
}
