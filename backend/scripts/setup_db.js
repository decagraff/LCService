const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promisify readline question
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3310,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true // Required for running schema.sql
};

// Data Generators
const firstNames = ['Carlos', 'Maria', 'Juan', 'Ana', 'Luis', 'Sofia', 'Pedro', 'Lucia', 'Miguel', 'Elena', 'Jose', 'Carmen', 'Jorge', 'Patricia', 'Ricardo', 'Isabel', 'Fernando', 'Rosa', 'Eduardo', 'Teresa'];
const lastNames = ['Perez', 'Lopez', 'Castillo', 'Torres', 'Gonzales', 'Rodriguez', 'Sanchez', 'Martinez', 'Flores', 'Gomez', 'Diaz', 'Reyes', 'Morales', 'Vasquez', 'Ramos', 'Jimenez', 'Ruiz', 'Alvarez', 'Romero', 'Gutierrez'];
const companies = ['Restaurante Central', 'Maido', 'Astrid y Gaston', 'Osso', 'El Rocoto', 'Panchita', 'La Mar', 'Isolina', 'Marriott', 'Belmond', 'Country Club', 'Swissotel', 'Westin', 'Bembos', 'Chilis', 'Presto', 'Pardos', 'Tostaduria Bisetti', 'San Antonio', 'Delosi'];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
    console.log('\n🚀 LC Service - Script de Configuración de Base de Datos Interactivo\n');

    try {
        // 1. Conexión a Base de Datos
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conectado al servidor MySQL');

        // 2. ¿Reiniciar Base de Datos?
        const resetDb = await question('⚠️  ¿Desea ELIMINAR y RECREAR la base de datos? (Esto BORRARÁ TODOS LOS DATOS) [y/N]: ');

        if (resetDb.toLowerCase() === 'y') {
            console.log('\n🗑️  Eliminando base de datos...');
            await connection.query(`DROP DATABASE IF EXISTS ${process.env.DB_NAME || 'lcservice_db'}`);

            console.log('✨ Creando base de datos desde schema.sql...');
            const schemaPath = path.join(__dirname, '../../database/schema.sql');
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');

            // Ejecutar esquema
            await connection.query(schemaSql);
            console.log('✅ Estructura de base de datos creada exitosamente');
        }

        // Cambiar a la base de datos
        await connection.changeUser({ database: process.env.DB_NAME || 'lcservice_db' });

        // 3. Generación de Usuarios
        console.log('\n👤 Configuración de Generación de Usuarios:');

        const adminCount = parseInt(await question('   ¿Cuántos Administradores? [Por defecto: 2]: ') || '2');
        const adminPass = await question('   Contraseña para Administradores: ');

        const vendorCount = parseInt(await question('   ¿Cuántos Vendedores? [Por defecto: 5]: ') || '5');
        const vendorPass = await question('   Contraseña para Vendedores: ');

        const clientCount = parseInt(await question('   ¿Cuántos Clientes? [Por defecto: 20]: ') || '20');
        const clientPass = await question('   Contraseña para Clientes: ');

        console.log('\n🔒 Encriptando contraseñas y generando usuarios...');

        const adminHash = await bcrypt.hash(adminPass, 10);
        const vendorHash = await bcrypt.hash(vendorPass, 10);
        const clientHash = await bcrypt.hash(clientPass, 10);

        // Insertar Usuarios
        const users = [];

        // Admins
        for (let i = 0; i < adminCount; i++) {
            users.push([
                `admin${i + 1}@lcservice.pe`,
                adminHash,
                getRandomElement(firstNames),
                getRandomElement(lastNames),
                'admin',
                '999000' + i.toString().padStart(3, '0'),
                'Oficina Central'
            ]);
        }

        // Vendedores
        for (let i = 0; i < vendorCount; i++) {
            users.push([
                `vendedor${i + 1}@lcservice.pe`,
                vendorHash,
                getRandomElement(firstNames),
                getRandomElement(lastNames),
                'vendedor',
                '988000' + i.toString().padStart(3, '0'),
                'Zona ' + getRandomElement(['Norte', 'Sur', 'Este', 'Oeste'])
            ]);
        }

        // Clientes
        for (let i = 0; i < clientCount; i++) {
            const company = companies[i % companies.length];
            users.push([
                `cliente${i + 1}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
                clientHash,
                getRandomElement(firstNames),
                getRandomElement(lastNames),
                'cliente',
                '977000' + i.toString().padStart(3, '0'),
                company
            ]);
        }

        if (users.length > 0) {
            await connection.query(
                'INSERT INTO users (email, password, nombre, apellido, role, telefono, direccion) VALUES ?',
                [users]
            );
            console.log(`✅ Se crearon ${users.length} usuarios`);
        }

        // 4. Generación de Inventario
        console.log('\n📦 Configuración de Generación de Inventario:');
        const categoryCount = parseInt(await question('   ¿Cuántas Categorías? [Por defecto: 10]: ') || '10');
        const itemsPerCategory = parseInt(await question('   ¿Ítems por Categoría? [Por defecto: 5]: ') || '5');

        const categoryNames = ['Mesas', 'Hornos', 'Refrigeracion', 'Lavado', 'Procesamiento', 'Estantes', 'Campanas', 'Menaje', 'Exhibicion', 'Cocinas', 'Bar', 'Transporte', 'Limpieza', 'Repuestos', 'Mobiliario'];

        // Insertar Categorías
        const categories = [];
        for (let i = 0; i < categoryCount; i++) {
            const name = categoryNames[i % categoryNames.length] + (i >= categoryNames.length ? ` ${i}` : '');
            categories.push([name, `Categoria profesional de ${name}`]);
        }

        if (categories.length > 0) {
            await connection.query('INSERT INTO categorias (nombre, descripcion) VALUES ?', [categories]);
            console.log(`✅ Se crearon ${categories.length} categorías`);
        }

        // Insertar Equipos
        const equipments = [];
        const materials = ['Acero AISI 304', 'Acero Galvanizado', 'Aluminio', 'Plastico Industrial'];

        for (let i = 1; i <= categoryCount; i++) {
            for (let j = 1; j <= itemsPerCategory; j++) {
                equipments.push([
                    i, // categoria_id
                    `EQ-${i}-${j}-${Date.now().toString().slice(-4)}`, // codigo
                    `Equipo ${categoryNames[(i - 1) % categoryNames.length]} Modelo ${j}`, // nombre
                    'Equipo profesional de alta durabilidad', // descripcion
                    getRandomElement(materials),
                    `${getRandomInt(50, 200)}x${getRandomInt(50, 100)}cm`,
                    getRandomInt(500, 15000), // precio
                    getRandomInt(0, 50) // stock
                ]);
            }
        }

        if (equipments.length > 0) {
            await connection.query(
                'INSERT INTO equipos (categoria_id, codigo, nombre, descripcion, material, dimensiones, precio, stock) VALUES ?',
                [equipments]
            );
            console.log(`✅ Se crearon ${equipments.length} equipos`);
        }

        // 5. Generación de Cotizaciones (Granular)
        console.log('\n📄 Configuración de Generación de Cotizaciones:');

        const startYear = parseInt(await question('   ¿Año de Inicio? [Por defecto: 2024]: ') || '2024');
        const endYear = parseInt(await question('   ¿Año de Fin? [Por defecto: 2025]: ') || '2025');

        const monthsInput = await question('   ¿Meses (1-12, separados por coma o "todos")? [Por defecto: todos]: ') || 'todos';
        let targetMonths = [];
        if (monthsInput.toLowerCase() === 'todos' || monthsInput.toLowerCase() === 'all') {
            targetMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        } else {
            targetMonths = monthsInput.split(',').map(m => parseInt(m.trim())).filter(m => !isNaN(m) && m >= 1 && m <= 12);
        }

        const minQuotes = parseInt(await question('   ¿Mínimo de cotizaciones por día? [Por defecto: 0]: ') || '0');
        const maxQuotes = parseInt(await question('   ¿Máximo de cotizaciones por día? [Por defecto: 3]: ') || '3');

        // Obtener IDs para relaciones
        const [clientRows] = await connection.query('SELECT id, nombre, apellido, direccion FROM users WHERE role = "cliente"');
        const [vendorRows] = await connection.query('SELECT id FROM users WHERE role = "vendedor"');
        const [equipmentRows] = await connection.query('SELECT id, precio FROM equipos');

        if (clientRows.length === 0 || vendorRows.length === 0 || equipmentRows.length === 0) {
            console.log('⚠️  Saltando generación de cotizaciones: No hay suficientes usuarios o equipos.');
        } else {
            console.log('\n⏳ Generando cotizaciones... Esto puede tomar un momento.');

            const statuses = ['borrador', 'enviada', 'aprobada', 'rechazada', 'vencida'];
            let totalQuotesGenerated = 0;

            for (let year = startYear; year <= endYear; year++) {
                for (const month of targetMonths) {
                    const daysInMonth = new Date(year, month, 0).getDate();

                    for (let day = 1; day <= daysInMonth; day++) {
                        const dailyCount = getRandomInt(minQuotes, maxQuotes);

                        for (let k = 0; k < dailyCount; k++) {
                            const client = getRandomElement(clientRows);
                            const vendor = getRandomElement(vendorRows);
                            const status = getRandomElement(statuses);

                            // Crear fecha con hora aleatoria entre 8am y 6pm
                            const date = new Date(year, month - 1, day, getRandomInt(8, 18), getRandomInt(0, 59));

                            // Saltar fechas futuras
                            if (date > new Date()) continue;

                            // Calcular updated_at para Simulación de Tesis
                            // Pre-Test (> 30 días): Respuesta lenta (2-7 días)
                            // Post-Test (<= 30 días): Respuesta rápida (5-120 minutos)
                            const updatedDate = new Date(date);
                            const ageInDays = (new Date() - date) / (1000 * 60 * 60 * 24);

                            if (ageInDays > 30) {
                                updatedDate.setDate(date.getDate() + getRandomInt(2, 7));
                            } else {
                                updatedDate.setMinutes(date.getMinutes() + getRandomInt(5, 120));
                            }

                            // Generar detalles
                            const itemsCount = getRandomInt(1, 5);
                            let subtotal = 0;
                            const currentQuoteDetails = [];

                            for (let m = 0; m < itemsCount; m++) {
                                const equip = getRandomElement(equipmentRows);
                                const qty = getRandomInt(1, 3);
                                const itemSubtotal = equip.precio * qty;
                                subtotal += itemSubtotal;

                                currentQuoteDetails.push({
                                    equipo_id: equip.id,
                                    cantidad: qty,
                                    precio_unitario: equip.precio,
                                    subtotal: itemSubtotal
                                });
                            }

                            const igv = subtotal * 0.18;
                            const total = subtotal + igv;

                            // Insertar Cotización
                            const [res] = await connection.query(
                                `INSERT INTO cotizaciones 
                                (numero_cotizacion, cliente_id, vendedor_id, empresa_cliente, contacto_cliente, subtotal, igv, total, estado, created_at, updated_at) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                [
                                    `COT-${year}-${(totalQuotesGenerated + 1).toString().padStart(6, '0')}`,
                                    client.id,
                                    vendor.id,
                                    client.direccion,
                                    `${client.nombre} ${client.apellido}`,
                                    subtotal,
                                    igv,
                                    total,
                                    status,
                                    date,
                                    updatedDate // Tiempo de respuesta simulado
                                ]
                            );

                            const quoteId = res.insertId;

                            // Insertar Detalles
                            const detailsValues = currentQuoteDetails.map(d => [
                                quoteId, d.equipo_id, d.cantidad, d.precio_unitario, d.subtotal
                            ]);

                            await connection.query(
                                'INSERT INTO cotizacion_detalles (cotizacion_id, equipo_id, cantidad, precio_unitario, subtotal) VALUES ?',
                                [detailsValues]
                            );

                            totalQuotesGenerated++;
                        }
                    }
                }
            }
            console.log(`✅ Se crearon ${totalQuotesGenerated} cotizaciones con detalles entre ${startYear}-${endYear}`);
        }

        console.log('\n🎉 ¡Configuración de base de datos completada exitosamente!');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        rl.close();
        process.exit(0);
    }
}

main();
