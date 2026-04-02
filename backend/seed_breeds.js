const prisma = require('./config/prisma');
const { v4: uuidv4 } = require('uuid');

const goatBreeds = [
  'Jamunapari', 'Beetal', 'Barbari', 'Sirohi', 'Sojat', 'Jakhrana',
  'Osmanabadi', 'Surti', 'Zalawadi', 'Tellicherry', 'Mehsana',
  'Gohilwadi', 'Marwari', 'Changthangi (Pashmina Goat)', 'Chegu', 'Gaddi',
  'African Boer', 'Damascus', 'Saanen'
];

const sheepBreeds = [
  'Muzaffarnagari', 'Rampur Bushair', 'Chokla (Shekhawati)', 'Patanwadi (Desi)',
  'Marwari', 'Magra', 'Pugal', 'Mandal', 'Chamba', 'Nellore',
  'Madgyal (Deccani type)', 'Deccani', 'Bellary', 'Mecheri', 'Ramnad White',
  'Kilakarsal', 'Tiruchy Black', 'Kenguri', 'Jaisalmeri', 'Chokla Sonadi',
  'Kheri', 'Bikaneri (Magra Type)'
];

/**
 * Seeds default breeds for a specific farm.
 * Used during user registration to initialize the farm's breed catalog.
 * 
 * @param {string} farmId - The ID of the farm to seed breeds for.
 * @param {object} tx - (Optional) Prisma transaction client to use.
 */
async function seedBreeds(farmId, tx = prisma) {
  try {
    console.log(`--- SEEDING BREEDS FOR FARM: ${farmId} ---`);

    const now = new Date();
    
    // Prepare all Goat breed data
    const goatData = goatBreeds.map(name => ({
      id: uuidv4(),
      name,
      animal_type: 'Goat',
      farm_id: farmId,
      is_default: false, // These are farm-specific copies
      created_at: now,
      updated_at: now
    }));

    // Prepare all Sheep breed data
    const sheepData = sheepBreeds.map(name => ({
      id: uuidv4(),
      name,
      animal_type: 'Sheep',
      farm_id: farmId,
      is_default: false, // These are farm-specific copies
      created_at: now,
      updated_at: now
    }));

    // Perform bulk insertion for high performance
    await tx.breeds.createMany({
        data: [...goatData, ...sheepData],
        skipDuplicates: true // Safety check
    });

    console.log(`Successfully seeded ${goatData.length + sheepData.length} breeds for farm ${farmId}.`);
  } catch (error) {
    console.error('Error seeding breeds for farm:', error);
    // Note: Do not exit the process if used as a library function
    if (require.main === module) process.exit(1);
    throw error;
  }
}

// Support for seeding all existing farms (used during manual data migration)
async function seedAllExistingFarms() {
    try {
        const farms = await prisma.farms.findMany();
        console.log(`Seeding breeds for ${farms.length} existing farms...`);
        for (const farm of farms) {
            await seedBreeds(farm.id);
        }
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

// Standalone execution support
if (require.main === module) {
    seedAllExistingFarms();
}

module.exports = { seedBreeds };
