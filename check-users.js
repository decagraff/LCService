require('dotenv').config();
const { pool } = require('./backend/config/database');

async function checkUsers() {
    try {
        const [rows] = await pool.execute('SELECT id, email, password IS NOT NULL as has_password, role FROM users');
        
        console.log('Usuarios en la base de datos:');
        console.table(rows);
        
        // Verificar usuario específico
        const [user] = await pool.execute('SELECT * FROM users WHERE email = ?', ['gerente@eldorado.com']);
        console.log('\nDatos completos del usuario de prueba:');
        console.log(user[0]);
        
        await pool.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkUsers();