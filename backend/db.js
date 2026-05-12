const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gestion_citas'
});

connection.connect((err) => {
    if (err) {
        console.log('Error de conexión:', err);
    } else {
        console.log('Conectado a MySQL');
    }
});

module.exports = connection;