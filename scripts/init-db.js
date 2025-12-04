const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function initDatabase() {
  let connection;
  
  try {
    // Connect without database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('Connected to MySQL server');

    // Read schema file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema
    await connection.query(schema);
    console.log('Database schema created successfully!');

    // Hash passwords for default users
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const warehousePassword = await bcrypt.hash('warehouse123', 10);
    const distributorPassword = await bcrypt.hash('distributor123', 10);
    const agentPassword = await bcrypt.hash('agent123', 10);
    const storePassword = await bcrypt.hash('store123', 10);

    // Update user passwords
    await connection.query(
      'UPDATE users SET password = ? WHERE email = ?',
      [adminPassword, 'admin@inventory.com']
    );
    await connection.query(
      'UPDATE users SET password = ? WHERE email = ?',
      [warehousePassword, 'warehouse@inventory.com']
    );
    await connection.query(
      'UPDATE users SET password = ? WHERE email = ?',
      [distributorPassword, 'distributor@inventory.com']
    );
    await connection.query(
      'UPDATE users SET password = ? WHERE email = ?',
      [agentPassword, 'agent@inventory.com']
    );
    await connection.query(
      'UPDATE users SET password = ? WHERE email = ?',
      [storePassword, 'store@inventory.com']
    );

    console.log('Default user passwords updated!');
    console.log('\nDefault login credentials:');
    console.log('Admin: admin@inventory.com / admin123');
    console.log('Warehouse: warehouse@inventory.com / warehouse123');
    console.log('Distributor: distributor@inventory.com / distributor123');
    console.log('Sales Agent: agent@inventory.com / agent123');
    console.log('Store: store@inventory.com / store123');

  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();

