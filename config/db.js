const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PWD,
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DB,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

poolConnect.then(() => {
    console.log('Connected to SQL Server');
}).catch((err) => {
    console.error('Database connection failed:', err);
});

module.exports = {
    sql,
    pool,
    poolConnect
};
