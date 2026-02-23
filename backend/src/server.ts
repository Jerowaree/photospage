import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB, prisma } from './lib/db';
import photoRoutes from './routes/photos';
import uploadRoutes from './routes/upload';

const app = express();
const PORT = Number(process.env.PORT ?? 5000);
const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';

/* ─── Middleware ──────────────────────────────────────────── */

app.use(cors({
    origin: [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:4321'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

/* ─── Routes ──────────────────────────────────────────────── */

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date() });
});

app.use('/api/photos', photoRoutes);
app.use('/api/upload', uploadRoutes);

/* ─── Error Handler ───────────────────────────────────────── */

app.use((
    err: Error & { status?: number },
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
) => {
    const status = err.status ?? 500;
    console.error(`[${status}]`, err.message);
    res.status(status).json({ success: false, message: err.message ?? 'Internal server error' });
});

/* ─── Start ───────────────────────────────────────────────── */

async function main() {
    await connectDB();

    const server = app.listen(PORT, () => {
        console.log(`🚀 API corriendo en http://localhost:${PORT}/api`);
    });

    // Graceful shutdown — cerrar conexiones de Prisma al terminar
    const shutdown = async (signal: string) => {
        console.log(`\n${signal} recibido. Cerrando servidor…`);
        server.close(async () => {
            await prisma.$disconnect();
            console.log('✅ Conexiones cerradas correctamente.');
            process.exit(0);
        });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch(console.error);
