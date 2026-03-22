require('./backend/node_modules/dotenv').config({ path: './backend/.env' });
const { VaccinationRecord, Animal, Vaccine } = require('./backend/models');

async function testQuery() {
  try {
    const records = await VaccinationRecord.findAll({
      include: [
        { model: Animal, as: 'animal' },
        { model: Vaccine, as: 'vaccine' }
      ]
    });
    console.log(`FOUND ${records.length} TOTAL RECORDS`);
    records.forEach(r => {
      console.log(`---`);
      console.log(`RECORD ID: ${r.id}`);
      console.log(`ANIMAL ID: ${r.animalId} | TAG: ${r.animal?.tagNumber}`);
      console.log(`VACCINE ID: ${r.vaccineId} | NAME: ${r.vaccine?.name}`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testQuery();
