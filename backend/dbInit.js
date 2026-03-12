const sequelize = require('./config/database');
const models = require('./models');

// Test database connection and sync models
const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connection has been established successfully.');
    // Create UUID extension if it doesn't exist
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    
    // In production, use migrations instead of {alter: true}
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = initDB;
