const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2'); 

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Use createPool instead of createConnection for production stability
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // Add this line for Cloud Databases (Render/Aiven/Railway)
    ssl: {
        rejectUnauthorized: false
    }
});

// For Pools, we check connection like this:
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ SUCCESS: Connected to MySQL Pool');
        connection.release(); // Release back to pool
    }
});

module.exports = db;