const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('postgresql://neondb_owner:npg_B3JmriLc8uPD@ep-fragrant-fire-adwg9dlk-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function check() {
  try {
    const [results] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
    console.log('Columns in users table:', results.map(r => r.column_name));
    
    const [results2] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'animals'");
    console.log('Columns in animals table:', results2.map(r => r.column_name));

    const [results3] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'breeds'");
    console.log('Columns in breeds table:', results3.map(r => r.column_name));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
