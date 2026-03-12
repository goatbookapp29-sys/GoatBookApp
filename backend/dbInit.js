const sequelize = require('./config/database');
const { User, Employee, Farm, FarmEmployee, Breed, Animal } = require('./models');

const initDB = async () => {
  try {
    // Authenticate connection
    await sequelize.authenticate();
    console.log('PostgreSQL Connection has been established successfully.');

    // Create extensions if needed
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // Sync all models
    // CAUTION: force: true will DROP all existing tables. 
    // This is necessary because we changed primary key types from INT to UUID.
    await sequelize.sync({ force: true });
    
    console.log('All models were synchronized successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

initDB();
