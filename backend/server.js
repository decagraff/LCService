const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const { testConnection } = require('./config/database');
const config = require('./config/config');
const chatRoutes = require('./routes/chat');

// Crear aplicación Express
const app = express();
if (process.env.NODE_ENV === 'production') {

    app.set('trust proxy', 1);

}
// Configurar CORS (permitir React en desarrollo)
const corsOptions = {
    origin: function (origin, callback) {
        // Permitir localhost en desarrollo y el dominio de producción
        const allowedOrigins = [
            'http://localhost:5190', // Vite dev server (React)
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:3000',
            'https://lc-service.decatron.net'
        ];

        // Permitir requests sin origin (como Postman, o same-origin)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true, // Permitir envío de cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middlewares básicos
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configurar archivos estáticos (solo uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configurar sesiones
app.use(session(config.session));

// IMPORTAR RUTAS
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const vendedorRoutes = require('./routes/vendedor');
const clienteRoutes = require('./routes/cliente');
const catalogRoutes = require('./routes/catalog');

// USAR RUTAS (ANTES de los middlewares de error)
app.use('/api/auth', authRoutes);  // Changed from /auth to /api/auth
app.use('/auth', authRoutes);       // Keep legacy route for compatibility
app.use('/api/chat', chatRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/admin', adminRoutes);
app.use('/vendedor', vendedorRoutes);
app.use('/cliente', clienteRoutes);
app.use('/api', require('./routes/api'));


// Ruta de prueba (API info)
app.get('/', (req, res) => {
    res.json({
        app: 'LC Service API',
        message: 'Sistema de Gestión de Cotizaciones',
        version: config.app.version,
        status: 'running'
    });
});

// Ruta de estado del sistema
app.get('/health', async (req, res) => {
    const dbStatus = await testConnection();
    res.json({
        status: 'OK',
        app: config.app.name,
        version: config.app.version,
        database: dbStatus ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString()
    });
});

// Middleware para manejo de errores 404 (DESPUÉS de todas las rutas)
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        status: 404,
        message: 'La ruta solicitada no existe'
    });
});

// Middleware para manejo de errores generales (ÚLTIMO)
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        status: 500,
        message: config.server.env === 'development' ? err.message : 'Error interno del servidor'
    });
});

// Iniciar servidor
async function startServer() {
    try {
        // Testear conexión a base de datos
        console.log('🔍 Verificando conexión a base de datos...');
        await testConnection();

        // Iniciar servidor
        app.listen(config.server.port, () => {
            console.log('\n🚀 ===================================');
            console.log(`📦 ${config.app.name} v${config.app.version}`);
            console.log(`🌐 Servidor ejecutándose en: http://localhost:${config.server.port}`);
            console.log(`⚙️  Entorno: ${config.server.env}`);
            console.log(`📊 Estado: http://localhost:${config.server.port}/health`);
            console.log('🚀 ===================================\n');
        });
    } catch (error) {
        console.error('❌ Error iniciando el servidor:', error);
        process.exit(1);
    }
}

// Manejo de cierre graceful
process.on('SIGTERM', () => {
    console.log('👋 Cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n👋 Cerrando servidor...');
    process.exit(0);
});

// Iniciar la aplicación
startServer();