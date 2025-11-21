const fetch = require('node-fetch');
const { pool } = require('../config/database');

// ==========================================
// CONFIGURACIÓN POR ROL
// ==========================================
const getRoleConfig = (user) => {
    const baseIdentity = `Soy Decatron, la Inteligencia Artificial oficial de LC Service, creada por AnthonyDeca.
Mi función es asistir exclusivamente con temas relacionados a LC Service: equipos gastronómicos de acero inoxidable, cotizaciones, pedidos e inventario.`;

    const configs = {
        cliente: {
            identity: `${baseIdentity}
Estoy hablando con ${user.nombre}, un cliente valioso de LC Service.
Como cliente, puedo ayudarte a:
- Buscar equipos y ver precios
- Consultar TUS cotizaciones (solo las tuyas)
- Explicar el proceso de compra
- Responder dudas sobre productos`,
            permissions: {
                canViewAllCotizaciones: false,
                canViewOtherUsers: false,
                canViewStats: false
            }
        },
        vendedor: {
            identity: `${baseIdentity}
Estoy hablando con ${user.nombre}, vendedor de LC Service.
Como vendedor, puedo ayudarte a:
- Buscar equipos, stock y precios
- Consultar cotizaciones de TUS clientes asignados
- Ver estadísticas de tus ventas
- Gestionar inventario`,
            permissions: {
                canViewAllCotizaciones: false, // Solo sus clientes
                canViewOtherUsers: false,
                canViewStats: true
            }
        },
        admin: {
            identity: `${baseIdentity}
Estoy hablando con ${user.nombre}, administrador de LC Service.
Como administrador, tienes acceso completo:
- Consultar TODAS las cotizaciones
- Ver información de todos los usuarios
- Estadísticas globales del sistema
- Gestión completa de inventario`,
            permissions: {
                canViewAllCotizaciones: true,
                canViewOtherUsers: true,
                canViewStats: true
            }
        }
    };

    return configs[user.role] || configs.cliente;
};

// Instrucción de sistema con restricción de temas
const getSystemInstruction = (roleConfig) => {
    return `${roleConfig.identity}

REGLAS ESTRICTAS:
1. SOLO respondo sobre LC Service, equipos gastronómicos, cotizaciones y temas del negocio.
2. Si me preguntan sobre otros temas (política, código, recetas, tareas, etc.), respondo amablemente:
   "Disculpa, mi especialidad es ayudarte con LC Service y equipos gastronómicos. ¿Te puedo ayudar con algún producto o cotización?"
3. NUNCA revelo información de otros usuarios o cotizaciones que no correspondan.
4. Soy breve, profesional y amable.
5. Uso las herramientas disponibles cuando necesito datos reales.
6. Si no tengo información, lo digo honestamente.`;
};

const chatController = {
    sendMessage: async (req, res) => {
        try {
            const { message, history } = req.body;
            const user = req.user; // Usuario de la sesión
            const apiKey = process.env.GEMINI_API_KEY;

            if (!apiKey) throw new Error("Falta GEMINI_API_KEY");
            if (!user) return res.status(401).json({ text: "Debes iniciar sesión para usar el chat." });

            // Obtener configuración según rol
            const roleConfig = getRoleConfig(user);

            // ==========================================
            // 1. CONSTRUCCIÓN DE HISTORIAL INTELIGENTE
            // ==========================================

            // Contexto inicial que refuerza identidad y restricciones
            const initialContext = [
                {
                    role: "user",
                    parts: [{ text: "Hola, ¿quién eres?" }]
                },
                {
                    role: "model",
                    parts: [{ text: `¡Hola ${user.nombre}! Soy Decatron, tu asistente de LC Service creado por AnthonyDeca. Estoy aquí para ayudarte con equipos gastronómicos, cotizaciones y todo lo relacionado con nuestro catálogo. ¿En qué puedo asistirte hoy?` }]
                }
            ];

            // Mapeamos el historial real del usuario
            const userHistory = history.map(msg => ({
                role: msg.role === 'admin' ? 'model' : msg.role,
                parts: [{ text: msg.parts[0].text }]
            }));

            // Combinamos: Contexto Falso + Historial Real + Mensaje Nuevo
            const contents = [
                ...initialContext,
                ...userHistory,
                { role: "user", parts: [{ text: message }] }
            ];

            // 2. Definición de Herramientas (según rol)
            const tools = [{
                function_declarations: [
                    {
                        name: "buscarProductos",
                        description: "Busca equipos gastronómicos en el catálogo de LC Service por nombre, código o características.",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                query: { type: "STRING", description: "Nombre o código del producto" }
                            },
                            required: ["query"]
                        }
                    },
                    {
                        name: "consultarCotizacion",
                        description: "Consulta el detalle de una cotización por su código (ej: COT-2025-001). Solo muestra cotizaciones permitidas según el rol del usuario.",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                codigo: { type: "STRING", description: "Código completo de la cotización" }
                            },
                            required: ["codigo"]
                        }
                    },
                    {
                        name: "misCotizaciones",
                        description: "Lista las cotizaciones del usuario actual (últimas 10).",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                estado: { type: "STRING", description: "Filtrar por estado: borrador, enviada, aprobada, rechazada (opcional)" }
                            }
                        }
                    }
                ]
            }];

            // 3. Configuración del Modelo            
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

            // ==========================================
            // PRIMERA LLAMADA (Pensamiento)
            // ==========================================
            let response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: contents,
                    tools: tools,
                    system_instruction: {
                        parts: [{ text: getSystemInstruction(roleConfig) }]
                    },
                    generationConfig: { maxOutputTokens: 800, temperature: 0.4 }
                })
            });

            let data = await response.json();

            if (data.error) {
                console.error("❌ Error API 1:", data.error);
                return res.json({ text: "Error de conexión con mi cerebro digital (API Error)." });
            }

            // ==========================================
            // LÓGICA DE HERRAMIENTAS
            // ==========================================
            const candidate = data.candidates?.[0];
            const functionCallPart = candidate?.content?.parts?.find(p => p.functionCall);

            if (functionCallPart) {
                const { name, args } = functionCallPart.functionCall;
                console.log(`🔧 Decatron ejecuta: ${name}`, args);

                let toolResult = {};

                try {
                    if (name === "buscarProductos") {
                        const q = args.query;
                        const [rows] = await pool.execute(
                            `SELECT nombre, codigo, precio, stock, descripcion FROM equipos
                             WHERE (nombre LIKE ? OR codigo LIKE ? OR descripcion LIKE ?)
                             AND activo = 1 LIMIT 5`,
                            [`%${q}%`, `%${q}%`, `%${q}%`]
                        );
                        toolResult = rows.length > 0
                            ? { productos: rows, mensaje: `Encontré ${rows.length} producto(s)` }
                            : { info: "No encontré productos con ese criterio. Intenta con otro término." };
                    }
                    else if (name === "consultarCotizacion") {
                        const codigo = args.codigo;

                        // Query base con validación de permisos
                        let query = `
                            SELECT c.numero_cotizacion, c.estado, c.total, c.created_at,
                                   u.nombre as cliente_nombre, u.empresa as cliente_empresa,
                                   c.cliente_id, c.vendedor_id
                            FROM cotizaciones c
                            JOIN users u ON c.cliente_id = u.id
                            WHERE c.numero_cotizacion = ?`;

                        let params = [codigo];

                        // Filtrar según rol
                        if (user.role === 'cliente') {
                            query += ` AND c.cliente_id = ?`;
                            params.push(user.id);
                        } else if (user.role === 'vendedor') {
                            query += ` AND c.vendedor_id = ?`;
                            params.push(user.id);
                        }
                        // Admin ve todo

                        const [cotizacion] = await pool.execute(query, params);

                        if (cotizacion.length > 0) {
                            const [detalles] = await pool.execute(
                                `SELECT e.nombre, cd.cantidad, cd.precio_unitario, cd.subtotal
                                 FROM cotizacion_detalles cd
                                 JOIN equipos e ON cd.equipo_id = e.id
                                 JOIN cotizaciones c ON cd.cotizacion_id = c.id
                                 WHERE c.numero_cotizacion = ?`,
                                [codigo]
                            );

                            toolResult = {
                                resumen: cotizacion[0],
                                items: detalles
                            };
                        } else {
                            toolResult = {
                                error: user.role === 'admin'
                                    ? "Cotización no encontrada. Verifica el código."
                                    : "Cotización no encontrada o no tienes permiso para verla."
                            };
                        }
                    }
                    else if (name === "misCotizaciones") {
                        const estado = args.estado;

                        let query = `
                            SELECT c.numero_cotizacion, c.estado, c.total, c.created_at,
                                   u.nombre as cliente_nombre
                            FROM cotizaciones c
                            JOIN users u ON c.cliente_id = u.id
                            WHERE 1=1`;

                        let params = [];

                        // Filtrar según rol
                        if (user.role === 'cliente') {
                            query += ` AND c.cliente_id = ?`;
                            params.push(user.id);
                        } else if (user.role === 'vendedor') {
                            query += ` AND c.vendedor_id = ?`;
                            params.push(user.id);
                        }
                        // Admin ve todo

                        if (estado) {
                            query += ` AND c.estado = ?`;
                            params.push(estado);
                        }

                        query += ` ORDER BY c.created_at DESC LIMIT 10`;

                        const [cotizaciones] = await pool.execute(query, params);

                        toolResult = cotizaciones.length > 0
                            ? { cotizaciones, total: cotizaciones.length }
                            : { info: "No tienes cotizaciones registradas." };
                    }
                } catch (err) {
                    console.error("Error SQL:", err);
                    toolResult = { error: "Error interno al consultar la base de datos." };
                }

                // ==========================================
                // SEGUNDA LLAMADA (Respuesta Final)
                // ==========================================

                // Construimos el historial para la segunda vuelta
                const newContents = [
                    ...contents,
                    candidate.content, // La petición de la IA ("quiero ejecutar X")
                    {
                        role: "function",
                        parts: [{
                            functionResponse: {
                                name: name,
                                response: { result: toolResult } // Envuelvo en 'result' para claridad
                            }
                        }]
                    }
                ];

                const response2 = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: newContents,
                        tools: tools
                    })
                });

                const data2 = await response2.json();

                // LOG PARA DEPURAR SI SALE VACÍO
                if (!data2.candidates) {
                    console.error("❌ Google devolvió vacío en vuelta 2:", JSON.stringify(data2, null, 2));
                    return res.json({ text: "Encontré los datos, pero tuve un problema al resumirlos. Intenta preguntar de nuevo." });
                }

                const finalAnswer = data2.candidates[0].content.parts[0].text;
                return res.json({ text: finalAnswer });
            }

            // Respuesta normal
            const normalAnswer = candidate?.content?.parts?.[0]?.text;
            res.json({ text: normalAnswer || "..." });

        } catch (error) {
            console.error('❌ Error Servidor:', error);
            res.status(500).json({ text: "Error interno del servidor." });
        }
    }
};

module.exports = chatController;