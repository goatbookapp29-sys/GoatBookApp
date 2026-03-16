const { Breed, Animal, Location } = require('../models');

// @desc    Get all breeds for the current farm
exports.getBreeds = async (req, res) => {
  try {
    if (!req.farmId) {
      return res.status(400).json({ message: 'No farm selected' });
    }

    const breeds = await Breed.findAll({
      where: { farmId: req.farmId },
      order: [['name', 'ASC']]
    });
    res.json(breeds);
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

    const breed = await Breed.create({
      name,
      animalType: animalType || 'Goat',
      farmId: req.farmId,
      createdByUserId: req.user.id
    });
    res.status(201).json(breed);
  } catch (err) {
    console.error('ADD BREED ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a breed
exports.updateBreed = async (req, res) => {
  const { name, animalType } = req.body;
  try {
    const breed = await Breed.findOne({
      where: { id: req.params.id, farmId: req.farmId }
    });

    if (!breed) {
      return res.status(404).json({ message: 'Breed not found in this farm' });
    }

    await breed.update({ name, animalType, updatedByUserId: req.user.id });
    res.json(breed);
  } catch (err) {
    console.error('UPDATE BREED ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a breed
exports.deleteBreed = async (req, res) => {
  try {
    const breed = await Breed.findOne({
      where: { id: req.params.id, farmId: req.farmId }
    });

    if (!breed) {
      return res.status(404).json({ message: 'Breed not found in this farm' });
    }

    // Check if animals are using this breed
    const animalCount = await Animal.count({ where: { breedId: breed.id } });
    if (animalCount > 0) {
      return res.status(400).json({ message: 'Cannot delete breed that is assigned to animals' });
    }

    await breed.destroy();
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
    const breed = await Breed.findOne({ where: { id, farmId: req.farmId } });
    if (!breed) return res.status(404).json({ message: 'Breed not found' });

    // Fetch animals of this breed with their location info
    const animals = await Animal.findAll({
      where: { breedId: id, farmId: req.farmId },
      include: [{ model: Location, attributes: ['name', 'code', 'type'] }]
    });

    // Group animals by location
    const distribution = {};
    animals.forEach(animal => {
      const locName = animal.Location?.name || 'Unassigned';
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
          tagNumber: animal.tagNumber,
          gender: animal.gender,
          Location: animal.Location
      });
    });

    res.json({
      breed,
      totalAnimals: animals.length,
      distribution: Object.values(distribution)
    });
  } catch (err) {
    console.error('GET BREED STATS ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
