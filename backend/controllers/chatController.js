const fetch = require('node-fetch');
const { pool } = require('../config/database');

const chatController = {
    sendMessage: async (req, res) => {
        try {
            const { message, history } = req.body;
            const apiKey = process.env.GEMINI_API_KEY;

            if (!apiKey) throw new Error("Falta GEMINI_API_KEY");

            // ==========================================
            // 1. CONSTRUCCIÓN DE HISTORIAL INTELIGENTE
            // ==========================================

            // TRUCO: Inyectamos una "conversación falsa" al inicio para forzar la identidad
            // Esto es más poderoso que el systemInstruction para modelos "tercos"
            const initialContext = [
                {
                    role: "user",
                    parts: [{ text: "Hola, ¿quién eres y quién te creó?" }]
                },
                {
                    role: "model",
                    parts: [{ text: "Soy Decatron, la Inteligencia Artificial oficial de LC Service. Fui creado por el desarrollador AnthonyDeca para asistir en la gestión de equipos gastronómicos." }]
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

            // 2. Definición de Herramientas
            const tools = [{
                function_declarations: [
                    {
                        name: "buscarProductos",
                        description: "Busca equipos en la base de datos. Úsalo para buscar por nombre, código o características.",
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
                        description: "Consulta el detalle de una cotización por su código (ej: COT-2025-001).",
                        parameters: {
                            type: "OBJECT",
                            properties: {
                                codigo: { type: "STRING", description: "Código completo de la cotización" }
                            },
                            required: ["codigo"]
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
                        parts: [{ text: "Eres Decatron, IA de LC Service creada por AnthonyDeca. Responde brevemente y usa las herramientas si es necesario." }]
                    },
                    generationConfig: { maxOutputTokens: 800, temperature: 0.5 }
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
                             WHERE nombre LIKE ? OR codigo LIKE ? LIMIT 5`,
                            [`%${q}%`, `%${q}%`]
                        );
                        toolResult = rows.length > 0 ? { productos: rows } : { info: "No se encontraron productos." };
                    }
                    else if (name === "consultarCotizacion") {
                        const codigo = args.codigo;

                        // 1. Buscar Cabecera
                        const [cotizacion] = await pool.execute(
                            `SELECT c.numero_cotizacion, c.estado, c.total, c.created_at, 
                                    u.nombre as cliente_nombre, u.empresa as cliente_empresa
                             FROM cotizaciones c
                             JOIN users u ON c.cliente_id = u.id
                             WHERE c.numero_cotizacion = ?`,
                            [codigo]
                        );

                        if (cotizacion.length > 0) {
                            // 2. Buscar Detalles (Productos)
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
                            toolResult = { error: "Cotización no encontrada. Verifica el código." };
                        }
                    }
                } catch (err) {
                    console.error("Error SQL:", err);
                    toolResult = { error: "Error interno al consultar BD." };
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