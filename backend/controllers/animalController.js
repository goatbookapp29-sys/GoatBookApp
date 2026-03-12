const { Animal, Breed, Location } = require('../models');

// @desc    Get all animals for the current farm
exports.getAnimals = async (req, res) => {
  try {
    if (!req.farmId) {
      return res.status(400).json({ message: 'No farm selected' });
    }

    const animals = await Animal.findAll({
      where: { farmId: req.farmId },
      include: [
        { model: Breed, attributes: ['name', 'animalType'] },
        { model: Location, attributes: ['name', 'code'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(animals);
  } catch (err) {
    console.error('FETCH ANIMALS ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add a new animal
exports.addAnimal = async (req, res) => {
  const { tagNumber, breedId, gender, birthDate, locationId } = req.body;
  
  try {
    if (!req.farmId) {
      return res.status(400).json({ message: 'No farm selected' });
    }

    // Verify breed belongs to this farm
    const breed = await Breed.findOne({ where: { id: breedId, farmId: req.farmId } });
    if (!breed) {
      return res.status(400).json({ message: 'Invalid breed selected for this farm' });
    }

    // Verify location belongs to this farm (if provided)
    if (locationId) {
        const location = await Location.findOne({ where: { id: locationId, farmId: req.farmId } });
        if (!location) {
            return res.status(400).json({ message: 'Invalid location selected for this farm' });
        }
    }

    const animal = await Animal.create({
      tagNumber,
      breedId,
      gender,
      birthDate,
      locationId: locationId || null,
      farmId: req.farmId,
      createdByEmployeeId: req.employee.id
    });

    res.status(201).json(animal);
  } catch (err) {
    console.error('ADD ANIMAL ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single animal details
exports.getAnimal = async (req, res) => {
  try {
    const animal = await Animal.findOne({
      where: { id: req.params.id, farmId: req.farmId },
      include: [
        { model: Breed },
        { model: Location }
      ]
    });

    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    res.json(animal);
  } catch (err) {
    console.error('FETCH ANIMAL ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update animal details
exports.updateAnimal = async (req, res) => {
  const { tagNumber, breedId, gender, birthDate, locationId } = req.body;
  try {
    const animal = await Animal.findOne({
      where: { id: req.params.id, farmId: req.farmId }
    });

    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    // Verify location if changing
    if (locationId) {
        const location = await Location.findOne({ where: { id: locationId, farmId: req.farmId } });
        if (!location) {
            return res.status(400).json({ message: 'Invalid location selected for this farm' });
        }
    }

    await animal.update({ 
        tagNumber, 
        breedId, 
        gender, 
        birthDate, 
        locationId: locationId || null 
    });
    res.json(animal);
  } catch (err) {
    console.error('UPDATE ANIMAL ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete an animal
exports.deleteAnimal = async (req, res) => {
  try {
    const animal = await Animal.findOne({
      where: { id: req.params.id, farmId: req.farmId }
    });

    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    await animal.destroy();
    res.json({ message: 'Animal removed' });
  } catch (err) {
    console.error('DELETE ANIMAL ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
