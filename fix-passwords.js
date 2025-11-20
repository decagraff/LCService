const bcrypt = require('bcryptjs');

async function generatePasswords() {
    const passwords = {
        'admin123': await bcrypt.hash('admin123', 12),
        'vendedor123': await bcrypt.hash('vendedor123', 12),
        'cliente123': await bcrypt.hash('cliente123', 12)
    };
    
    console.log('Contraseñas hasheadas:');
    console.log('admin123 =>', passwords['admin123']);
    console.log('vendedor123 =>', passwords['vendedor123']);
    console.log('cliente123 =>', passwords['cliente123']);
    
    console.log('\nSQL para actualizar:');
    console.log(`UPDATE users SET password = '${passwords['admin123']}' WHERE email = 'admin@lcservice.pe';`);
    console.log(`UPDATE users SET password = '${passwords['vendedor123']}' WHERE email = 'juan.perez@lcservice.pe';`);
    console.log(`UPDATE users SET password = '${passwords['cliente123']}' WHERE email = 'gerente@eldorado.com';`);
}

generatePasswords();