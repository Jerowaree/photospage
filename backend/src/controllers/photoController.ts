import type { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/db';
import { uploadBuffer, deleteFromCloudinary } from '../lib/cloudinary';

/* ─── Esquemas de validación ────────────────────────────────────── */

const uploadSchema = z.object({
    title: z.string().min(1).max(120),
    category: z.string().min(1).max(60),
    description: z.string().max(500).optional(),
    tags: z.string().optional(),
    featured: z.union([z.literal('true'), z.literal('false')]).optional(),
});

const updateSchema = z.object({
    title: z.string().min(1).max(120).optional(),
    description: z.string().max(500).optional(),
    category: z.string().min(1).max(60).optional(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
});

/* ─── Controladores ─────────────────────────────────────────────── */

export async function getPhotos(req: Request, res: Response) {
    try {
        const {
            category,
            page = '1',
            limit = '24',
            featured,
        } = req.query as Record<string, string>;

        const pageNum = Math.max(1, Number(page));
        const limitNum = Math.min(100, Math.max(1, Number(limit)));
        const skip = (pageNum - 1) * limitNum;

        const where = {
            ...(category && { category: category.toLowerCase() }),
            ...(featured === 'true' && { featured: true }),
        };

        const [photos, total] = await prisma.$transaction([
            prisma.photo.findMany({
                where,
                orderBy: { uploadedAt: 'desc' },
                skip,
                take: limitNum,
            }),
            prisma.photo.count({ where }),
        ]);

        res.json({
            success: true,
            data: {
                photos,
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: (err as Error).message });
    }
}

export async function getPhotoById(req: Request, res: Response) {
    try {
        const photo = await prisma.photo.findUnique({
            where: { id: req.params.id },
        });
        if (!photo) {
            return res.status(404).json({ success: false, message: 'Foto no encontrada' });
        }
        res.json({ success: true, data: photo });
    } catch (err) {
        res.status(500).json({ success: false, message: (err as Error).message });
    }
}

export async function getCategories(_req: Request, res: Response) {
    try {
        const groups = await prisma.photo.groupBy({
            by: ['category'],
            _count: { _all: true },
            orderBy: { category: 'asc' },
        });

        // Obtener la miniatura de portada de cada categoría
        const covers = await prisma.photo.findMany({
            where: { category: { in: groups.map((g: { category: string }) => g.category) } },
            distinct: ['category'],
            orderBy: { uploadedAt: 'desc' },
            select: { category: true, thumbnailUrl: true },
        });

        const coverMap = Object.fromEntries(
            covers.map((c: { category: string; thumbnailUrl: string }) => [c.category, c.thumbnailUrl])
        );

        const categories = groups.map((g: { category: string; _count: { _all: number } }) => ({
            slug: g.category,
            label: g.category.charAt(0).toUpperCase() + g.category.slice(1),
            count: g._count._all,
            coverUrl: coverMap[g.category] ?? null,
        }));

        res.json({ success: true, data: categories });
    } catch (err) {
        res.status(500).json({ success: false, message: (err as Error).message });
    }
}

export async function uploadPhoto(req: Request, res: Response) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No se proporcionó ningún archivo' });
        }

        const parsed = uploadSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(422).json({
                success: false,
                message: 'Datos inválidos',
                errors: parsed.error.flatten(),
            });
        }

        const { title, category, description, tags: tagsRaw, featured } = parsed.data;
        const tags = tagsRaw
            ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
            : [];

        const { url, thumbnailUrl, publicId, width, height } = await uploadBuffer(
            req.file.buffer,
            { folder: `aldryck/${category}` },
        );

        const photo = await prisma.photo.create({
            data: {
                title,
                category: category.toLowerCase(),
                description: description ?? '',
                tags,
                url,
                thumbnailUrl,
                publicId,
                width,
                height,
                aspectRatio: parseFloat((width / height).toFixed(4)),
                featured: featured === 'true',
            },
        });

        res.status(201).json({ success: true, data: photo });
    } catch (err) {
        res.status(500).json({ success: false, message: (err as Error).message });
    }
}

export async function updatePhoto(req: Request, res: Response) {
    try {
        const parsed = updateSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(422).json({
                success: false,
                message: 'Datos inválidos',
                errors: parsed.error.flatten(),
            });
        }

        const photo = await prisma.photo.update({
            where: { id: req.params.id },
            data: parsed.data,
        }).catch(() => null);

        if (!photo) {
            return res.status(404).json({ success: false, message: 'Foto no encontrada' });
        }
        res.json({ success: true, data: photo });
    } catch (err) {
        res.status(500).json({ success: false, message: (err as Error).message });
    }
}

export async function deletePhoto(req: Request, res: Response) {
    try {
        const photo = await prisma.photo.delete({
            where: { id: req.params.id },
        }).catch(() => null);

        if (!photo) {
            return res.status(404).json({ success: false, message: 'Foto no encontrada' });
        }

        // Eliminar de Cloudinary
        await deleteFromCloudinary(photo.publicId);

        res.json({ success: true, data: null, message: 'Foto eliminada correctamente' });
    } catch (err) {
        res.status(500).json({ success: false, message: (err as Error).message });
    }
}
