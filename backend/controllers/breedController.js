const prisma = require('../config/prisma');
const { v4: uuidv4 } = require('uuid');

// @desc    Get all breeds for the current farm
exports.getBreeds = async (req, res) => {
  try {
    if (!req.farmId) {
      return res.status(400).json({ message: 'No farm selected' });
    }

    const breeds = await prisma.breeds.findMany({
      where: { farm_id: req.farmId },
      orderBy: { name: 'asc' }
    });

    // Map to camelCase for frontend
    res.json(breeds.map(b => ({
      id: b.id,
      name: b.name,
      animalType: b.animal_type,
      farmId: b.farm_id,
      createdAt: b.created_at,
      updatedAt: b.updated_at
    })));
  } catch (err) {
    console.error('FETCH BREEDS ERROR:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Add a new breed to a farm
exports.addBreed = async (req, res) => {
  const { name, animalType } = req.body;
  try {
    if (!req.farmId) {
      return res.status(400).json({ message: 'No farm selected' });
    }

    const now = new Date();
    const breed = await prisma.breeds.create({
      data: {
        id: uuidv4(),
        name,
        animal_type: animalType || 'Goat',
        farm_id: req.farmId,
        created_by_user_id: req.user.id,
        created_at: now,
        updated_at: now
      }
    });

    res.status(201).json({
      id: breed.id,
      name: breed.name,
      animalType: breed.animal_type,
      farmId: breed.farm_id,
      createdAt: breed.created_at
    });
  } catch (err) {
    console.error('ADD BREED ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a breed
exports.updateBreed = async (req, res) => {
  const { name, animalType } = req.body;
  try {
    const breed = await prisma.breeds.findFirst({
      where: { id: req.params.id, farm_id: req.farmId }
    });

    if (!breed) {
      return res.status(404).json({ message: 'Breed not found in this farm' });
    }

    const updated = await prisma.breeds.update({
      where: { id: req.params.id },
      data: { name, animal_type: animalType, updated_by_user_id: req.user.id, updated_at: new Date() }
    });

    res.json({
      id: updated.id,
      name: updated.name,
      animalType: updated.animal_type,
      farmId: updated.farm_id,
      updatedAt: updated.updated_at
    });
  } catch (err) {
    console.error('UPDATE BREED ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a breed
exports.deleteBreed = async (req, res) => {
  try {
    const breed = await prisma.breeds.findFirst({
      where: { id: req.params.id, farm_id: req.farmId }
    });

    if (!breed) {
      return res.status(404).json({ message: 'Breed not found in this farm' });
    }

    // Check if animals are using this breed
    const animalCount = await prisma.animals.count({ where: { breed_id: breed.id } });
    if (animalCount > 0) {
      return res.status(400).json({ message: 'Cannot delete breed that is assigned to animals' });
    }

    await prisma.breeds.delete({ where: { id: req.params.id } });
    res.json({ message: 'Breed removed' });
  } catch (err) {
    console.error('DELETE BREED ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get animals of a specific breed with stats
exports.getBreedStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if breed exists and belongs to farm
    const breed = await prisma.breeds.findFirst({ where: { id, farm_id: req.farmId } });
    if (!breed) return res.status(404).json({ message: 'Breed not found' });

    // Fetch animals of this breed with their location info
    const animals = await prisma.animals.findMany({
      where: { breed_id: id, farm_id: req.farmId },
      include: { locations: { select: { name: true, code: true, type: true } } }
    });

    // Group animals by location
    const distribution = {};
    animals.forEach(animal => {
      const locName = animal.locations?.name || 'Unassigned';
      if (!distribution[locName]) {
        distribution[locName] = {
          locationName: locName,
          count: 0,
          animals: []
        };
      }
      distribution[locName].count += 1;
      distribution[locName].animals.push({
          id: animal.id,
          tagNumber: animal.tag_number,
          gender: animal.gender,
          Location: animal.locations
      });
    });

    res.json({
      breed: { id: breed.id, name: breed.name, animalType: breed.animal_type },
      totalAnimals: animals.length,
      distribution: Object.values(distribution)
    });
  } catch (err) {
    console.error('GET BREED STATS ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
