import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

/**
 * Singleton del cliente Prisma (Prisma 7 con driver adapter pg).
 * En desarrollo, tsx/nodemon recrea el módulo en cada cambio;
 * reutilizar la instancia evita agotar las conexiones de la BD.
 */
const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
    const adapter = new PrismaPg({
        connectionString: process.env.DATABASE_URL!,
    });
    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development'
            ? ['query', 'warn', 'error']
            : ['warn', 'error'],
    });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

/**
 * Verifica la conexión ejecutando una consulta mínima.
 * Lanza excepción si la BD no está accesible.
 */
export async function connectDB(): Promise<void> {
    try {
        await prisma.$queryRaw`SELECT 1`;
        console.log('✅ PostgreSQL conectado (Prisma)');
    } catch (error) {
        console.error('❌ Error de conexión a PostgreSQL:', error);
        process.exit(1);
    }
}
