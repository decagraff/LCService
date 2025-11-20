require('dotenv').config();

module.exports = {
    // Configuración del servidor
    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development'
    },

    // Configuración de sesiones
    session: {
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 horas
        }
    },

    // Configuración de uploads
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
        uploadPath: process.env.UPLOAD_PATH || 'backend/uploads/images'
    },

    // Configuración de la aplicación
    app: {
        name: 'LC Service',
        version: '1.0.0',
        description: 'Sistema de Gestión de Cotizaciones'
    }
};