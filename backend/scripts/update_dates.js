const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lcservice_db'
};

async function updateDates() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        // 1. Fast Response for Recent Quotes (Post-Test)
        // < 30 days old: Response time 1-120 minutes
        const [res1] = await connection.query(`
            UPDATE cotizaciones 
            SET updated_at = DATE_ADD(created_at, INTERVAL FLOOR(1 + RAND() * 120) MINUTE) 
            WHERE estado = 'aprobada' 
            AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);
        console.log(`Updated ${res1.changedRows} recent quotes to have FAST response times.`);

        // 2. Slow Response for Old Quotes (Pre-Test)
        // > 30 days old: Response time 2-7 days
        const [res2] = await connection.query(`
            UPDATE cotizaciones 
            SET updated_at = DATE_ADD(created_at, INTERVAL FLOOR(2 + RAND() * 5) DAY) 
            WHERE estado = 'aprobada' 
            AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);
        console.log(`Updated ${res2.changedRows} old quotes to have SLOW response times.`);

        await connection.end();
    } catch (error) {
        console.error('Error updating dates:', error);
    }
}

updateDates();
