const { body } = require('express-validator');
const User = require('../models/User');

const authValidators = {
    // Validaciones para login
    login: [
        body('email')
            .isEmail()
            .withMessage('Debe ser un email válido')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 6 })
            .withMessage('La contraseña debe tener al menos 6 caracteres')
    ],

    // Validaciones para registro
    register: [
        body('email')
            .isEmail()
            .withMessage('Debe ser un email válido')
            .normalizeEmail()
            .custom(async (email) => {
                const existingUser = await User.findByEmail(email);
                if (existingUser) {
                    throw new Error('Este email ya está registrado');
                }
                return true;
            }),
        body('password')
            .isLength({ min: 6 })
            .withMessage('La contraseña debe tener al menos 6 caracteres'),
        body('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Las contraseñas no coinciden');
                }
                return true;
            }),
        body('nombre')
            .trim()
            .isLength({ min: 2 })
            .withMessage('El nombre debe tener al menos 2 caracteres'),
        body('apellido')
            .optional()
            .trim()
            .isLength({ min: 2 })
            .withMessage('El apellido debe tener al menos 2 caracteres'),
        body('telefono')
            .optional()
            .isMobilePhone('es-PE')
            .withMessage('Debe ser un número de teléfono válido'),
        body('empresa')
            .optional()
            .trim()
            .isLength({ max: 255 })
            .withMessage('El nombre de la empresa es muy largo')
    ]
};

const profileValidators = {
    updateProfile: [
        body('nombre')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
        body('apellido')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('El apellido debe tener entre 2 y 50 caracteres'),
        body('telefono')
            .optional()
            .trim()
            .isLength({ max: 20 })
            .withMessage('El teléfono no puede tener más de 20 caracteres'),
        body('empresa')
            .optional()
            .trim()
            .isLength({ max: 255 })
            .withMessage('El nombre de la empresa es muy largo')
    ]
};

const categoryValidators = {
    createUpdate: [
        body('nombre')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
        body('descripcion')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('La descripción no puede tener más de 500 caracteres')
    ]
};

const equipmentValidators = {
    createUpdate: [
        body('categoria_id')
            .isInt({ min: 1 })
            .withMessage('Debe seleccionar una categoría válida')
            .custom(async (value) => {
                const Categoria = require('../models/Categoria');
                const categoria = await Categoria.findById(value);
                if (!categoria) {
                    throw new Error('La categoría seleccionada no existe');
                }
                return true;
            }),
        body('codigo')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('El código debe tener entre 2 y 50 caracteres')
            .matches(/^[A-Z0-9-_.x×]+$/i) // ← CORREGIDO: Más flexible, incluye x y ×
            .withMessage('El código puede contener letras, números, guiones (-), guiones bajos (_), punto (.) y x')
            .customSanitizer(value => value.toUpperCase()) // Convertir a mayúsculas automáticamente
            .custom(async (value, { req }) => {
                const Equipo = require('../models/Equipo');
                const equipoId = req.params?.id;
                const exists = await Equipo.codeExists(value, equipoId);
                if (exists) {
                    throw new Error('Este código ya está en uso, debe ser único');
                }
                return true;
            }),
        body('nombre')
            .trim()
            .isLength({ min: 2, max: 255 })
            .withMessage('El nombre debe tener entre 2 y 255 caracteres')
            .notEmpty()
            .withMessage('El nombre es obligatorio'),
        body('descripcion')
            .optional()
            .trim()
            .isLength({ max: 1000 })
            .withMessage('La descripción no puede tener más de 1000 caracteres'),
        body('material')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('El material no puede tener más de 100 caracteres'),
        body('dimensiones')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('Las dimensiones no pueden tener más de 100 caracteres')
            .matches(/^[\d\s.x×,\-cm]+$/i) // ← CORREGIDO: Incluye cm, puntos y más flexibilidad
            .optional()
            .withMessage('Las dimensiones pueden contener números, espacios, puntos, x, ×, comas, guiones y "cm"'),
        body('precio')
            .isFloat({ min: 0.01, max: 999999.99 })
            .withMessage('El precio debe ser un número entre S/. 0.01 y S/. 999,999.99')
            .toFloat(),
        body('stock')
            .isInt({ min: 0, max: 999999 })
            .withMessage('El stock debe ser un número entero entre 0 y 999,999')
            .toInt(),
        body('imagen_url')
            .optional()
            .trim()
            .custom((value) => {
                if (!value) return true;
                
                try {
                    new URL(value);
                } catch (e) {
                    throw new Error('La URL de la imagen no es válida');
                }
                
                const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
                const validImageUrl = imageExtensions.test(value) || 
                                    value.includes('unsplash.com') || 
                                    value.includes('pexels.com') ||
                                    value.includes('via.placeholder.com') ||
                                    value.includes('picsum.photos') ||
                                    value.includes('images.unsplash.com');
                
                if (!validImageUrl) {
                    throw new Error('La URL debe ser de una imagen válida');
                }
                
                return true;
            })
    ]
};

const cotizacionValidation = [
    body('empresa_cliente')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('El nombre de la empresa no puede exceder 255 caracteres'),
        
    body('contacto_cliente')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('El nombre del contacto no puede exceder 255 caracteres'),
        
    body('notas')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Las notas no pueden exceder 1000 caracteres'),
        
    body('vendedor_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID de vendedor inválido')
];

// Actualizar exports
module.exports = {
    // Auth validators
    loginValidation: authValidators.login,
    registerValidation: authValidators.register,
    
    // Profile validators
    profileValidation: profileValidators.updateProfile,
    
    // Category validators
    categoryValidation: categoryValidators.createUpdate,
    
    // Equipment validators
    equipmentValidation: equipmentValidators.createUpdate,

    // Cotizacion validators
    cotizacionValidation: cotizacionValidation,

    
};