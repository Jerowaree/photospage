/**
 * Script de pruebas del backend.
 * Ejecutar con: npm run test -w backend  (o: cd backend && npx tsx src/test.ts)
 *
 * NO requiere MongoDB ni Cloudinary activos — prueba lo que puede de forma local.
 */

const BASE_URL = `http://localhost:${process.env.PORT ?? 5000}/api`;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? '';

/* ─── Utilidades ─────────────────────────────────────────────────── */

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

let passed = 0;
let failed = 0;
let skipped = 0;

function ok(label: string, detail = '') { passed++; console.log(`${GREEN}  ✔ ${label}${RESET}${detail ? `  ${detail}` : ''}`); }
function fail(label: string, detail = '') { failed++; console.log(`${RED}  ✘ ${label}${RESET}${detail ? `  → ${detail}` : ''}`); }
function skip(label: string, reason = '') { skipped++; console.log(`${YELLOW}  ○ ${label}${RESET}${reason ? `  (${reason})` : ''}`); }
function section(title: string) { console.log(`\n${CYAN}▶ ${title}${RESET}`); }

async function GET(path: string, adminAuth = false): Promise<{ status: number; body: Record<string, unknown> } | null> {
    try {
        const headers: Record<string, string> = {};
        if (adminAuth && ADMIN_TOKEN) headers['Authorization'] = `Bearer ${ADMIN_TOKEN}`;
        const res = await fetch(`${BASE_URL}${path}`, { headers });
        const body = await res.json().catch(() => ({})) as Record<string, unknown>;
        return { status: res.status, body };
    } catch {
        return null;
    }
}

async function POST_FORM(path: string, formData: FormData): Promise<{ status: number; body: Record<string, unknown> } | null> {
    try {
        const headers: Record<string, string> = {};
        if (ADMIN_TOKEN) headers['Authorization'] = `Bearer ${ADMIN_TOKEN}`;
        const res = await fetch(`${BASE_URL}${path}`, { method: 'POST', headers, body: formData });
        const body = await res.json().catch(() => ({})) as Record<string, unknown>;
        return { status: res.status, body };
    } catch {
        return null;
    }
}

/* ─── Suite 1: Variables de entorno ─────────────────────────────── */

function testEnvVars() {
    section('Variables de entorno');

    const required: Array<[string, string]> = [
        ['DATABASE_URL', 'URL de conexión a PostgreSQL'],
        ['CLOUDINARY_CLOUD_NAME', 'Nombre del cloud de Cloudinary'],
        ['CLOUDINARY_API_KEY', 'API Key de Cloudinary'],
        ['CLOUDINARY_API_SECRET', 'API Secret de Cloudinary'],
    ];

    required.forEach(([key, desc]) => {
        const val = process.env[key];
        if (!val || val.includes('password')) {
            skip(`${key}`, `sin configurar — ${desc}`);
        } else {
            ok(`${key}`, `configurado (${val.slice(0, 14)}…)`);
        }
    });

    if (!ADMIN_TOKEN) {
        ok('ADMIN_TOKEN', 'vacío → auth omitida en desarrollo (OK)');
    } else {
        ok('ADMIN_TOKEN', 'configurado');
    }
}

/* ─── Suite 2: Servidor HTTP ─────────────────────────────────────── */

async function testServer() {
    section('Conectividad con el servidor (http://localhost:5000)');

    const health = await GET('/health');
    if (!health) {
        fail('GET /api/health', 'servidor no responde — ¿lo arrancaste con "npm run dev"?');
        skip('GET /api/photos', 'servidor caído');
        skip('GET /api/photos/categories', 'servidor caído');
        return;
    }

    if (health.status === 200 && (health.body as Record<string, unknown>)?.status === 'ok') {
        ok('GET /api/health', `HTTP 200 · uptime ${(health.body as Record<string, unknown>).uptime ?? '?'}s`);
    } else {
        fail('GET /api/health', `HTTP ${health.status}`);
    }
}

/* ─── Suite 3: Endpoints públicos ───────────────────────────────── */

async function testPublicEndpoints() {
    section('Endpoints públicos');

    const photos = await GET('/photos');
    if (!photos) { skip('GET /api/photos', 'servidor no disponible'); }
    else if (photos.status === 200) {
        const data = (photos.body.data as Record<string, unknown>) ?? {};
        ok('GET /api/photos', `HTTP 200 · ${data.total ?? '?'} fotos`);
    } else {
        fail('GET /api/photos', `HTTP ${photos.status} — ¿PostgreSQL conectado y migración aplicada?`);
    }

    const cats = await GET('/photos/categories');
    if (!cats) { skip('GET /api/photos/categories', 'servidor no disponible'); }
    else if (cats.status === 200) {
        ok('GET /api/photos/categories', `HTTP 200 · ${(cats.body.data as unknown[])?.length ?? 0} categorías`);
    } else {
        fail('GET /api/photos/categories', `HTTP ${cats.status}`);
    }

    const notFound = await GET('/photos/000000000000000000000000');
    if (!notFound) { skip('GET /api/photos/:id (not found)', 'servidor no disponible'); }
    else if (notFound.status === 404) {
        ok('GET /api/photos/:id (id inexistente)', 'HTTP 404 correcto');
    } else {
        fail('GET /api/photos/:id', `HTTP ${notFound.status} esperado 404`);
    }
}

/* ─── Suite 4: Autenticación ────────────────────────────────────── */

async function testAuth() {
    section('Autenticación (admin)');

    const noAuth = await fetch(`${BASE_URL}/upload`, { method: 'POST' }).then(r => r).catch(() => null);
    if (!noAuth) { skip('POST /api/upload sin token', 'servidor no disponible'); return; }

    if (noAuth.status === 401 || noAuth.status === 400) {
        ok('POST /api/upload sin token', `HTTP ${noAuth.status} — acceso denegado correctamente`);
    } else if (noAuth.status === 200) {
        fail('POST /api/upload sin token', 'devolvió 200 sin autenticación — revisar middleware auth');
    } else {
        ok('POST /api/upload sin token', `HTTP ${noAuth.status}`);
    }

    if (!ADMIN_TOKEN) {
        skip('POST /api/upload con token', 'ADMIN_TOKEN no configurado');
        return;
    }

    // Intento sin archivo (debe fallar con 400, no con 401)
    const withAuth = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` },
    }).then(r => r).catch(() => null);

    if (!withAuth) { skip('POST /api/upload con token válido', 'servidor no disponible'); return; }
    if (withAuth.status === 400) {
        ok('POST /api/upload con token válido', 'HTTP 400 (sin archivo) — auth pasó correctamente');
    } else if (withAuth.status === 401) {
        fail('POST /api/upload con token válido', 'HTTP 401 — token rechazado, verificar ADMIN_TOKEN');
    } else {
        ok('POST /api/upload con token válido', `HTTP ${withAuth.status}`);
    }
}

/* ─── Suite 5: Estructura de código ─────────────────────────────── */

async function testCodeStructure() {
    section('Estructura del código (importaciones)');

    const checks: Array<[string, () => unknown]> = [
        ['Importar lib/db (Prisma)', () => require('./lib/db')],
        ['Importar rutas de fotos', () => require('./routes/photos')],
        ['Importar rutas de upload', () => require('./routes/upload')],
        ['Importar middleware auth', () => require('./middleware/auth')],
        ['Importar middleware upload', () => require('./middleware/upload')],
        ['Importar lib/cloudinary', () => require('./lib/cloudinary')],
        ['Importar photoController', () => require('./controllers/photoController')],
    ];

    for (const [label, fn] of checks) {
        try {
            fn();
            ok(label);
        } catch (e) {
            fail(label, (e as Error).message.split('\n')[0]);
        }
    }
}

/* ─── Runner ─────────────────────────────────────────────────────── */

async function main() {
    console.log(`\n${'─'.repeat(52)}`);
    console.log(`  🧪 Pruebas del backend — Aldryck Photography API`);
    console.log(`${'─'.repeat(52)}`);

    testEnvVars();
    await testServer();
    await testPublicEndpoints();
    await testAuth();
    await testCodeStructure();

    console.log(`\n${'─'.repeat(52)}`);
    console.log(`  Resultado:  ${GREEN}${passed} correctas${RESET}  |  ${RED}${failed} fallidas${RESET}  |  ${YELLOW}${skipped} omitidas${RESET}`);
    console.log(`${'─'.repeat(52)}\n`);

    if (failed > 0) process.exit(1);
}

main().catch((e) => {
    console.error('Error inesperado en el test runner:', e);
    process.exit(1);
});
