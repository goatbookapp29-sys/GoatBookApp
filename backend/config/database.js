const { Sequelize } = require('sequelize');
require('dotenv').config();

// Debug logs (excluding password)
if (process.env.DATABASE_URL) {
  console.log('CONNECTING VIA DATABASE_URL');
} else {
  console.log('DB CONFIG:', {
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT
  });
}

let sequelize;

if (process.env.DATABASE_URL) {
  // Use the connection string (Neon / Production)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // Use individual variables (Local Development)
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: false,
    }
  );
}

module.exports = sequelize;
