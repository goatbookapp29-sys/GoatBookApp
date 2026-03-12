const { Breed } = require('../models');

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
    res.status(500).json({ message: 'Server Error' });
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
      createdByEmployeeId: req.employee.id
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

    await breed.update({ name, animalType });
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

    await breed.destroy();
    res.json({ message: 'Breed removed' });
  } catch (err) {
    console.error('DELETE BREED ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
