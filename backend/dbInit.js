const sequelize = require('./config/database');
const { User, Employee, Farm, FarmEmployee, Breed, Animal, Location, Weight } = require('./models');

const initDB = async () => {
  try {
    // Authenticate connection
    await sequelize.authenticate();
    console.log('PostgreSQL Connection has been established successfully.');

    // Create extensions if needed
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // Sync all models - use alter to update existing tables
    await sequelize.sync({ alter: true });
    
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = initDB;
