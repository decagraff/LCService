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

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

// Generar respuesta manual si la IA falla
const formatToolResultManually = (toolName, result, role) => {
    const baseUrl = 'https://lc-service.decatron.net';

    if (toolName === 'consultarCotizacion' && result.resumen) {
        const r = result.resumen;
        const items = result.items || [];
        let response = `📋 **Cotización ${r.numero_cotizacion}**\n\n`;
        response += `• Estado: ${r.estado.toUpperCase()}\n`;
        response += `• Cliente: ${r.cliente_nombre}${r.cliente_empresa ? ` (${r.cliente_empresa})` : ''}\n`;
        response += `• Total: S/. ${parseFloat(r.total).toFixed(2)}\n`;
        response += `• Fecha: ${new Date(r.created_at).toLocaleDateString('es-PE')}\n\n`;

        if (items.length > 0) {
            response += `**Productos (${items.length}):**\n`;
            items.forEach(item => {
                response += `  - ${item.nombre} x${item.cantidad} = S/. ${parseFloat(item.subtotal).toFixed(2)}\n`;
            });
        }

        response += `\n\n👉 Ver cotización: ${baseUrl}/${role}/cotizaciones/${r.id}`;
        return response;
    }

    if (toolName === 'misCotizaciones' && result.cotizaciones) {
        let response = `📋 **Tus últimas cotizaciones (${result.total}):**\n\n`;
        result.cotizaciones.forEach(c => {
            response += `• **${c.numero_cotizacion}** - ${c.estado} - S/. ${parseFloat(c.total).toFixed(2)}\n`;
            response += `  👉 ${baseUrl}/${role}/cotizaciones/${c.id}\n`;
        });
        return response;
    }

    if (toolName === 'buscarProductos' && result.productos) {
        let response = `🔍 **Encontré ${result.productos.length} producto(s):**\n\n`;
        result.productos.forEach(p => {
            response += `• **${p.nombre}** (${p.codigo}) - ID: ${p.id}\n`;
            response += `  Precio: S/. ${parseFloat(p.precio).toFixed(2)} | Stock: ${p.stock}\n`;
        });
        response += `\n\n👉 Ver catálogo: ${baseUrl}/${role}/catalogo`;
        return response;
    }

    if (toolName === 'agregarAlCarrito' && result.success) {
        return `✅ ${result.mensaje}\n\n🛒 Carrito: ${result.carrito.items} item(s) en ${result.carrito.productos} producto(s)`;
    }

    if (toolName === 'verCarrito' && result.items) {
        let response = `🛒 **Tu carrito:**\n\n`;
        result.items.forEach(item => {
            response += `• ${item.nombre} x${item.cantidad} = S/. ${(item.cantidad * item.precio_unitario).toFixed(2)}\n`;
        });
        response += `\n**Resumen:**\n`;
        response += `• Subtotal: S/. ${result.resumen.subtotal}\n`;
        response += `• IGV (18%): S/. ${result.resumen.igv}\n`;
        response += `• **Total: S/. ${result.resumen.total}**`;
        return response;
    }

    if (toolName === 'buscarClientes' && result.clientes) {
        let response = `👥 **Clientes encontrados:**\n\n`;
        result.clientes.forEach(c => {
            response += `• **${c.nombre} ${c.apellido || ''}** (ID: ${c.id})\n`;
            response += `  ${c.empresa ? `Empresa: ${c.empresa} | ` : ''}${c.email}\n`;
        });
        return response;
    }

    if (toolName === 'crearCotizacion' && result.success) {
        const cot = result.cotizacion;
        return `✅ **${result.mensaje}**\n\n📋 Detalles:\n• Número: ${cot.numero}\n• Total: S/. ${cot.total}\n• Productos: ${cot.items}\n\n👉 Ver cotización: ${baseUrl}/${role}/cotizaciones/${cot.id}`;
    }

    return "Encontré información pero no pude formatearla correctamente.";
};

// Agregar links relevantes a la respuesta de la IA
const addLinksToResponse = (response, toolResult, role) => {
    const baseUrl = 'https://lc-service.decatron.net';
    let enhancedResponse = response;

    // Si hay cotización, agregar link con ID
    if (toolResult?.resumen?.id) {
        const id = toolResult.resumen.id;
        const codigo = toolResult.resumen.numero_cotizacion;
        if (!response.includes(baseUrl)) {
            enhancedResponse += `\n\n👉 Ver cotización ${codigo}: ${baseUrl}/${role}/cotizaciones/${id}`;
        }
    }

    // Si hay productos, agregar link al catálogo
    if (toolResult?.productos && toolResult.productos.length > 0) {
        if (!response.includes('/catalogo')) {
            enhancedResponse += `\n\n👉 Ver catálogo: ${baseUrl}/${role}/catalogo`;
        }
    }

    // Si hay lista de cotizaciones, agregar links individuales
    if (toolResult?.cotizaciones && toolResult.cotizaciones.length > 0) {
        if (!response.includes('/cotizaciones/')) {
            enhancedResponse += `\n\n📋 Links directos:`;
            toolResult.cotizaciones.slice(0, 3).forEach(c => {
                enhancedResponse += `\n• ${c.numero_cotizacion}: ${baseUrl}/${role}/cotizaciones/${c.id}`;
            });
        }
    }

    return enhancedResponse;
};

// Instrucción de sistema con restricción de temas
const getSystemInstruction = (roleConfig, user) => {
    const isCliente = user.role === 'cliente';

    return `${roleConfig.identity}

INFORMACIÓN DEL USUARIO ACTUAL:
- ID: ${user.id}
- Nombre: ${user.nombre}
- Rol: ${user.role}
${isCliente ? `- IMPORTANTE: Como cliente, YA CONOZCO su ID (${user.id}). NUNCA le preguntes su ID de cliente.` : ''}

REGLAS ESTRICTAS:
1. SOLO respondo sobre LC Service, equipos gastronómicos, cotizaciones y temas del negocio.
2. Si me preguntan sobre otros temas (política, código, recetas, tareas, etc.), respondo amablemente:
   "Disculpa, mi especialidad es ayudarte con LC Service y equipos gastronómicos. ¿Te puedo ayudar con algún producto o cotización?"
3. NUNCA revelo información de otros usuarios o cotizaciones que no correspondan.
4. Soy breve, profesional y amable.
5. Uso las herramientas disponibles cuando necesito datos reales.
6. Si no tengo información, lo digo honestamente.
7. SIEMPRE proporciono el link directo cuando creo una cotización o busco una.

FLUJO DE COTIZACIÓN DESDE CHAT:
1. Cuando el usuario quiera cotizar un producto:
   - Busca el producto con "buscarProductos" (soy flexible con mayúsculas/minúsculas)
   - Pregunta la cantidad si no la especificó
   - Usa "agregarAlCarrito" con el equipoId y cantidad
   - Pregunta si quiere agregar más productos o generar la cotización

2. Para crear la cotización:
   - Si es CLIENTE: usa "crearCotizacion" DIRECTAMENTE SIN PEDIR ID (ya sé que es cliente ID ${user.id})
   - Si es VENDEDOR: primero usa "buscarClientes" para encontrar el cliente, luego "crearCotizacion" con clienteId
   - Si es ADMIN: usa "buscarClientes", luego "crearCotizacion" con clienteId (vendedorId es opcional)

3. Después de crear una cotización SIEMPRE incluye el link directo en el formato:
   "Tu cotización ha sido creada. Puedes verla aquí: [link]"

4. Herramientas disponibles:
   - buscarProductos: Buscar equipos por nombre/código (case-insensitive)
   - agregarAlCarrito: Agregar producto al carrito (necesita equipoId del producto)
   - verCarrito: Ver contenido actual del carrito
   - buscarClientes: Buscar clientes (solo vendedor/admin)
   - crearCotizacion: Crear cotización con los productos del carrito`;
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
                    },
                    {
                        name: "agregarAlCarrito",
                        description: "Agrega un producto al carrito de compras. Usar después de buscar un producto.",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                equipoId: { type: "NUMBER", description: "ID del producto a agregar" },
                                cantidad: { type: "NUMBER", description: "Cantidad a agregar (default: 1)" }
                            },
                            required: ["equipoId"]
                        }
                    },
                    {
                        name: "verCarrito",
                        description: "Muestra el contenido actual del carrito de compras.",
                        parameters: {
                            type: "OBJECT",
                            properties: {}
                        }
                    },
                    {
                        name: "crearCotizacion",
                        description: "Crea una cotización con los productos del carrito. Para vendedor/admin: requiere clienteId. Para admin: puede especificar vendedorId.",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                clienteId: { type: "NUMBER", description: "ID del cliente (requerido para vendedor/admin)" },
                                vendedorId: { type: "NUMBER", description: "ID del vendedor (solo admin, opcional)" },
                                notas: { type: "STRING", description: "Notas adicionales para la cotización" }
                            }
                        }
                    },
                    {
                        name: "buscarClientes",
                        description: "Busca clientes por nombre o empresa. Solo disponible para vendedor y admin.",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                query: { type: "STRING", description: "Nombre o empresa del cliente a buscar" }
                            },
                            required: ["query"]
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
                        parts: [{ text: getSystemInstruction(roleConfig, user) }]
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
                        const q = args.query.toLowerCase().trim();
                        const [rows] = await pool.execute(
                            `SELECT id, nombre, codigo, precio, stock, descripcion FROM equipos
                             WHERE (LOWER(nombre) LIKE LOWER(?) OR LOWER(codigo) LIKE LOWER(?) OR LOWER(descripcion) LIKE LOWER(?))
                             AND estado = 'activo' LIMIT 5`,
                            [`%${q}%`, `%${q}%`, `%${q}%`]
                        );
                        toolResult = rows.length > 0
                            ? { productos: rows, mensaje: `Encontré ${rows.length} producto(s)` }
                            : { info: "No encontré productos con ese criterio. Intenta con otro término o categoría." };
                    }
                    else if (name === "consultarCotizacion") {
                        const codigo = args.codigo;

                        // Query base con validación de permisos
                        let query = `
                            SELECT c.id, c.numero_cotizacion, c.estado, c.total, c.created_at,
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
                            SELECT c.id, c.numero_cotizacion, c.estado, c.total, c.created_at,
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
                    // ==========================================
                    // HERRAMIENTAS DE COTIZACIÓN DESDE CHAT
                    // ==========================================
                    else if (name === "agregarAlCarrito") {
                        const equipoId = args.equipoId;
                        const cantidad = args.cantidad || 1;

                        // Verificar que el producto existe
                        const [producto] = await pool.execute(
                            `SELECT id, nombre, codigo, precio, stock FROM equipos WHERE id = ? AND estado = 'activo'`,
                            [equipoId]
                        );

                        if (producto.length === 0) {
                            toolResult = { error: "Producto no encontrado o no disponible." };
                        } else if (producto[0].stock < cantidad) {
                            toolResult = { error: `Stock insuficiente. Solo hay ${producto[0].stock} unidades disponibles.` };
                        } else {
                            // Inicializar carrito si no existe
                            if (!req.session.carrito) {
                                req.session.carrito = [];
                            }

                            // Buscar si ya existe en el carrito
                            const existingIndex = req.session.carrito.findIndex(item => item.equipo_id === equipoId);

                            if (existingIndex >= 0) {
                                req.session.carrito[existingIndex].cantidad += cantidad;
                            } else {
                                req.session.carrito.push({
                                    equipo_id: equipoId,
                                    nombre: producto[0].nombre,
                                    codigo: producto[0].codigo,
                                    precio_unitario: parseFloat(producto[0].precio),
                                    cantidad: cantidad,
                                    imagen_url: null
                                });
                            }

                            const totalItems = req.session.carrito.reduce((sum, item) => sum + item.cantidad, 0);
                            toolResult = {
                                success: true,
                                mensaje: `Agregado: ${producto[0].nombre} x${cantidad}`,
                                producto: producto[0],
                                carrito: {
                                    items: totalItems,
                                    productos: req.session.carrito.length
                                }
                            };
                        }
                    }
                    else if (name === "verCarrito") {
                        const carrito = req.session.carrito || [];

                        if (carrito.length === 0) {
                            toolResult = { info: "Tu carrito está vacío. Busca productos y agrégalos." };
                        } else {
                            const subtotal = carrito.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
                            const igv = subtotal * 0.18;
                            const total = subtotal + igv;

                            toolResult = {
                                items: carrito,
                                resumen: {
                                    cantidad_items: carrito.reduce((sum, item) => sum + item.cantidad, 0),
                                    subtotal: subtotal.toFixed(2),
                                    igv: igv.toFixed(2),
                                    total: total.toFixed(2)
                                }
                            };
                        }
                    }
                    else if (name === "buscarClientes") {
                        // Solo disponible para vendedor y admin
                        if (user.role === 'cliente') {
                            toolResult = { error: "No tienes permiso para buscar clientes." };
                        } else {
                            const q = args.query.toLowerCase().trim();
                            const [clientes] = await pool.execute(
                                `SELECT id, nombre, apellido, email, empresa FROM users
                                 WHERE role = 'cliente' AND estado = 'activo'
                                 AND (LOWER(nombre) LIKE ? OR LOWER(apellido) LIKE ? OR LOWER(empresa) LIKE ? OR LOWER(email) LIKE ?)
                                 LIMIT 5`,
                                [`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`]
                            );

                            toolResult = clientes.length > 0
                                ? { clientes, mensaje: `Encontré ${clientes.length} cliente(s)` }
                                : { info: "No encontré clientes con ese criterio." };
                        }
                    }
                    else if (name === "crearCotizacion") {
                        const carrito = req.session.carrito || [];

                        if (carrito.length === 0) {
                            toolResult = { error: "El carrito está vacío. Agrega productos antes de crear la cotización." };
                        } else {
                            let clienteId = args.clienteId;
                            let vendedorId = args.vendedorId;
                            const notas = args.notas || '';

                            // Validar según rol
                            if (user.role === 'cliente') {
                                clienteId = user.id;
                                vendedorId = null;
                            } else if (user.role === 'vendedor') {
                                if (!clienteId) {
                                    toolResult = { error: "Debes especificar un cliente. Usa 'buscarClientes' para encontrarlo." };
                                } else {
                                    vendedorId = user.id;
                                }
                            } else if (user.role === 'admin') {
                                if (!clienteId) {
                                    toolResult = { error: "Debes especificar un cliente. Usa 'buscarClientes' para encontrarlo." };
                                }
                                // vendedorId es opcional para admin
                            }

                            // Si no hay error, crear la cotización
                            if (!toolResult.error) {
                                // Calcular totales
                                const subtotal = carrito.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
                                const igv = subtotal * 0.18;
                                const total = subtotal + igv;

                                // Generar número de cotización
                                const year = new Date().getFullYear();
                                const [lastCot] = await pool.execute(
                                    `SELECT numero_cotizacion FROM cotizaciones
                                     WHERE numero_cotizacion LIKE ?
                                     ORDER BY id DESC LIMIT 1`,
                                    [`COT-${year}-%`]
                                );

                                let nextNum = 1;
                                if (lastCot.length > 0) {
                                    const lastNumStr = lastCot[0].numero_cotizacion.split('-')[2];
                                    nextNum = parseInt(lastNumStr) + 1;
                                }
                                const numeroCotizacion = `COT-${year}-${String(nextNum).padStart(6, '0')}`;

                                // Insertar cotización
                                const [result] = await pool.execute(
                                    `INSERT INTO cotizaciones (numero_cotizacion, cliente_id, vendedor_id, subtotal, igv, total, notas, estado)
                                     VALUES (?, ?, ?, ?, ?, ?, ?, 'enviada')`,
                                    [numeroCotizacion, clienteId, vendedorId, subtotal, igv, total, notas]
                                );

                                const cotizacionId = result.insertId;

                                // Insertar detalles
                                for (const item of carrito) {
                                    await pool.execute(
                                        `INSERT INTO cotizacion_detalles (cotizacion_id, equipo_id, cantidad, precio_unitario, subtotal)
                                         VALUES (?, ?, ?, ?, ?)`,
                                        [cotizacionId, item.equipo_id, item.cantidad, item.precio_unitario, item.cantidad * item.precio_unitario]
                                    );
                                }

                                // Limpiar carrito
                                req.session.carrito = [];

                                toolResult = {
                                    success: true,
                                    cotizacion: {
                                        id: cotizacionId,
                                        numero: numeroCotizacion,
                                        total: total.toFixed(2),
                                        items: carrito.length
                                    },
                                    mensaje: `¡Cotización ${numeroCotizacion} creada exitosamente!`
                                };
                            }
                        }
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
                        tools: tools,
                        system_instruction: {
                            parts: [{ text: getSystemInstruction(roleConfig, user) }]
                        }
                    })
                });

                const data2 = await response2.json();

                // LOG PARA DEPURAR SI SALE VACÍO
                if (!data2.candidates || !data2.candidates[0]?.content?.parts) {
                    console.error("❌ Google devolvió vacío en vuelta 2:", JSON.stringify(data2, null, 2));

                    // Intentar generar respuesta manual con los datos obtenidos
                    if (toolResult && !toolResult.error) {
                        return res.json({
                            text: formatToolResultManually(name, toolResult, user.role),
                            data: toolResult
                        });
                    }
                    return res.json({ text: "Encontré los datos, pero tuve un problema al resumirlos. Intenta preguntar de nuevo." });
                }

                const finalAnswer = data2.candidates[0]?.content?.parts?.[0]?.text || "No pude generar una respuesta.";

                // Agregar links si hay datos relevantes
                const responseWithLinks = addLinksToResponse(finalAnswer, toolResult, user.role);
                return res.json({ text: responseWithLinks });
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