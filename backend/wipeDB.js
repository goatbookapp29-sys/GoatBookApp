const sequelize = require('./config/database');
const { User, Employee, Farm, FarmEmployee, Breed, Animal } = require('./models');

const wipeAndInit = async () => {
  try {
    console.log('STARTING DATABASE RESET (FORCE=TRUE)...');
    await sequelize.authenticate();
    console.log('Connection established.');

    // Force sync will DROP all tables and recreate them based on current models
    await sequelize.sync({ force: true });
    
    console.log('DATABASE RESET SUCCESSFUL. All tables recreated with new schema.');
    process.exit(0);
  } catch (error) {
    console.error('DATABASE RESET FAILED:', error);
    process.exit(1);
  }
};

wipeAndInit();
