import type { Request, Response, NextFunction } from 'express';

/**
 * Simple token-based middleware for the admin API.
 * Replace with proper JWT/session auth in production.
 */
export function requireAdminToken(req: Request, res: Response, next: NextFunction): void {
    const adminToken = process.env.ADMIN_TOKEN;

    if (!adminToken) {
        // If no token is configured, skip auth in development
        if (process.env.NODE_ENV !== 'production') return next();
        res.status(500).json({ success: false, message: 'ADMIN_TOKEN not configured' });
        return;
    }

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : req.headers['x-admin-token'];

    if (token !== adminToken) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
    }

    next();
}
