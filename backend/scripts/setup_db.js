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
    port: process.env.DB_PORT || 3306,
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
    console.log('\n🚀 LC Service - Interactive Database Setup Script\n');

    try {
        // 1. Database Connection
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to MySQL server');

        // 2. Reset Database?
        const resetDb = await question('⚠️  Do you want to DROP and RECREATE the database? (This will DELETE ALL DATA) [y/N]: ');

        if (resetDb.toLowerCase() === 'y') {
            console.log('\n🗑️  Dropping database...');
            await connection.query(`DROP DATABASE IF EXISTS ${process.env.DB_NAME || 'lcservice_db'}`);

            console.log('✨ Creating database from schema.sql...');
            const schemaPath = path.join(__dirname, '../../database/schema.sql');
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');

            // Execute schema
            await connection.query(schemaSql);
            console.log('✅ Database structure created successfully');
        }

        // Switch to the database
        await connection.changeUser({ database: process.env.DB_NAME || 'lcservice_db' });

        // 3. User Generation
        console.log('\n👤 User Generation Configuration:');

        const adminCount = parseInt(await question('   How many Admins? [Default: 2]: ') || '2');
        const adminPass = await question('   Password for Admins: ');

        const vendorCount = parseInt(await question('   How many Vendors? [Default: 5]: ') || '5');
        const vendorPass = await question('   Password for Vendors: ');

        const clientCount = parseInt(await question('   How many Clients? [Default: 20]: ') || '20');
        const clientPass = await question('   Password for Clients: ');

        console.log('\n🔒 Encrypting passwords and generating users...');

        const adminHash = await bcrypt.hash(adminPass, 10);
        const vendorHash = await bcrypt.hash(vendorPass, 10);
        const clientHash = await bcrypt.hash(clientPass, 10);

        // Insert Users
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

        // Vendors
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

        // Clients
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
            console.log(`✅ Created ${users.length} users`);
        }

        // 4. Inventory Generation
        console.log('\n📦 Inventory Generation Configuration:');
        const categoryCount = parseInt(await question('   How many Categories? [Default: 10]: ') || '10');
        const itemsPerCategory = parseInt(await question('   Items per Category? [Default: 5]: ') || '5');

        const categoryNames = ['Mesas', 'Hornos', 'Refrigeracion', 'Lavado', 'Procesamiento', 'Estantes', 'Campanas', 'Menaje', 'Exhibicion', 'Cocinas', 'Bar', 'Transporte', 'Limpieza', 'Repuestos', 'Mobiliario'];

        // Insert Categories
        const categories = [];
        for (let i = 0; i < categoryCount; i++) {
            const name = categoryNames[i % categoryNames.length] + (i >= categoryNames.length ? ` ${i}` : '');
            categories.push([name, `Categoria profesional de ${name}`]);
        }

        if (categories.length > 0) {
            await connection.query('INSERT INTO categorias (nombre, descripcion) VALUES ?', [categories]);
            console.log(`✅ Created ${categories.length} categories`);
        }

        // Insert Equipment
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
            console.log(`✅ Created ${equipments.length} equipment items`);
        }

        // 5. Quotes Generation
        console.log('\n📄 Quotes Generation Configuration:');
        const quoteCount = parseInt(await question('   How many Quotes? [Default: 50]: ') || '50');

        // Get IDs for relationships
        const [clientRows] = await connection.query('SELECT id, nombre, apellido, direccion FROM users WHERE role = "cliente"');
        const [vendorRows] = await connection.query('SELECT id FROM users WHERE role = "vendedor"');
        const [equipmentRows] = await connection.query('SELECT id, precio FROM equipos');

        if (clientRows.length === 0 || vendorRows.length === 0 || equipmentRows.length === 0) {
            console.log('⚠️  Skipping quotes generation: Not enough users or equipment.');
        } else {
            const quotes = [];
            const quoteDetails = [];
            const statuses = ['borrador', 'enviada', 'aprobada', 'rechazada', 'vencida'];

            for (let i = 0; i < quoteCount; i++) {
                const client = getRandomElement(clientRows);
                const vendor = getRandomElement(vendorRows);
                const status = getRandomElement(statuses);
                const date = new Date();
                date.setDate(date.getDate() - getRandomInt(0, 60)); // Past 60 days

                // Generate details first to calculate totals
                const itemsCount = getRandomInt(1, 5);
                let subtotal = 0;
                const currentQuoteDetails = [];

                for (let k = 0; k < itemsCount; k++) {
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

                // Insert Quote
                const [res] = await connection.query(
                    `INSERT INTO cotizaciones 
                    (numero_cotizacion, cliente_id, vendedor_id, empresa_cliente, contacto_cliente, subtotal, igv, total, estado, created_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        `COT-2025-${(i + 1).toString().padStart(4, '0')}`,
                        client.id,
                        vendor.id,
                        client.direccion, // Using direccion as company
                        `${client.nombre} ${client.apellido}`,
                        subtotal,
                        igv,
                        total,
                        status,
                        date
                    ]
                );

                const quoteId = res.insertId;

                // Insert Details
                const detailsValues = currentQuoteDetails.map(d => [
                    quoteId, d.equipo_id, d.cantidad, d.precio_unitario, d.subtotal
                ]);

                await connection.query(
                    'INSERT INTO cotizacion_detalles (cotizacion_id, equipo_id, cantidad, precio_unitario, subtotal) VALUES ?',
                    [detailsValues]
                );
            }
            console.log(`✅ Created ${quoteCount} quotes with details`);
        }

        console.log('\n🎉 Database setup completed successfully!');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        rl.close();
        process.exit(0);
    }
}

main();
