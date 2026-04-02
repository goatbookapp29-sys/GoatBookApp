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

async function seedBreeds(farmId) {
  try {
    await prisma.$connect();
    console.log('--- STARTING GLOBAL BREED SEEDING ---');

    let count = 0;
    const now = new Date();

    // 1. Seed Goat Breeds as System Defaults
    for (const breedName of goatBreeds) {
      const exists = await prisma.breeds.findFirst({
        where: { name: breedName, is_default: true }
      });

      if (!exists) {
        await prisma.breeds.create({
          data: {
            id: uuidv4(),
            name: breedName,
            animal_type: 'Goat',
            farm_id: null,        // Global breed
            is_default: true,    // Available to all farms
            created_at: now,
            updated_at: now
          }
        });
        count++;
        console.log(`+ Added Global Goat Breed: ${breedName}`);
      }
    }

    // 2. Seed Sheep Breeds as System Defaults
    for (const breedName of sheepBreeds) {
      const exists = await prisma.breeds.findFirst({
        where: { name: breedName, is_default: true }
      });

      if (!exists) {
        await prisma.breeds.create({
          data: {
            id: uuidv4(),
            name: breedName,
            animal_type: 'Sheep',
            farm_id: farmId,        // Global breed
            is_default: true,    // Available to all farms
            created_at: now,
            updated_at: now
          }
        });
        count++;
        console.log(`+ Added Global Sheep Breed: ${breedName}`);
      }
    }

    console.log(`\nSuccessfully seeded ${count} global default breeds.`);
    console.log('--- SEEDING COMPLETE ---');
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding breeds:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

