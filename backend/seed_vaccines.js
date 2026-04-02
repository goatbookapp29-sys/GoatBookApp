const { v4: uuidv4 } = require('uuid');

const defaultVaccines = [
  {
    name: "PPR",
    disease_name: "Peste des Petits Ruminants",
    dose_ml: 1.0,
    application_route: "Subcutaneous",
    immunity_duration_days: 1460, // 4 years
    next_due_duration_days: 1095, // 3 years
    is_default: true,
  },
  {
    name: "ET",
    disease_name: "Enterotoxemia",
    dose_ml: 2.0,
    application_route: "Subcutaneous",
    immunity_duration_days: 365, // 1 year
    next_due_duration_days: 365,
    is_default: true,
  },
  {
    name: "FMD",
    disease_name: "Foot and Mouth Disease",
    dose_ml: 0.5,
    application_route: "Intramuscular",
    immunity_duration_days: 365,
    next_due_duration_days: 365,
    is_default: true,
  },
  {
    name: "HS",
    disease_name: "Hemorrhagic Septicemia",
    dose_ml: 0.5,
    application_route: "Intramuscular",
    immunity_duration_days: 365,
    next_due_duration_days: 365,
    is_default: true,
  },
  {
    name: "FMD + HS",
    disease_name: "FMD and HS Combined",
    dose_ml: 1.0,
    application_route: "Intramuscular",
    immunity_duration_days: 365,
    next_due_duration_days: 365,
    is_default: true,
  },
  {
    name: "Goat Pox",
    disease_name: "Goat Pox",
    dose_ml: 1.0,
    application_route: "Subcutaneous",
    immunity_duration_days: 365,
    next_due_duration_days: 365,
    is_default: true,
  },
  {
    name: "FMD + HS + BQ",
    disease_name: "FMD + HS + Black Quarter",
    dose_ml: 1.0,
    application_route: "Intramuscular",
    immunity_duration_days: 365,
    next_due_duration_days: 365,
    is_default: true,
  }
];

/**
 * Seeds default vaccines for a specific farm.
 * @param {string} farmId - The UUID of the farm to seed for.
 * @param {object} tx - (Optional) Prisma transaction client.
 */
async function seedVaccines(farmId, tx) {
  const prisma = tx || require('./config/prisma');
  const now = new Date();

  console.log(`--- SEEDING VACCINES FOR FARM: ${farmId} ---`);

  // Prepare data for bulk insert
  const vaccineData = defaultVaccines.map(v => ({
    id: uuidv4(),
    ...v,
    farm_id: farmId,
    created_at: now,
    updated_at: now
  }));

  try {
    const result = await prisma.vaccines.createMany({
      data: vaccineData,
      skipDuplicates: true
    });
    console.log(`Successfully seeded ${result.count} vaccines for farm ${farmId}.`);
    return result;
  } catch (error) {
    console.error(`Error seeding vaccines for farm ${farmId}:`, error);
    throw error;
  }
}

module.exports = { seedVaccines };
