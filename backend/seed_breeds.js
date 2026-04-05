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
 * @param {string} farmId - The UUID of the farm to seed for.
 * @param {object} tx - (Optional) Prisma transaction client.
 */
async function seedBreeds(farmId, tx) {
  const prisma = tx || require('./config/prisma');
  const now = new Date();

  console.log(`--- SEEDING BREEDS FOR FARM: ${farmId} ---`);

  // Prepare data for bulk insert
  const breedData = [
    ...goatBreeds.map(name => ({
      id: uuidv4(),
      name,
      animal_type: 'Goat',
      farm_id: farmId,
      is_default: true,
      created_at: now,
      updated_at: now
    })),
    ...sheepBreeds.map(name => ({
      id: uuidv4(),
      name,
      animal_type: 'Sheep',
      farm_id: farmId,
      is_default: true,
      created_at: now,
      updated_at: now
    }))
  ];

  try {
    const result = await prisma.breeds.createMany({
      data: breedData,
      skipDuplicates: true
    });
    console.log(`Successfully seeded ${result.count} breeds for farm ${farmId}.`);
    return result;
  } catch (error) {
    console.error(`Error seeding breeds for farm ${farmId}:`, error);
    throw error;
  }
}
module.exports = { seedBreeds };
