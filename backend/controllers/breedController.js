const { Breed } = require('../models');

// @desc    Get all breeds for the current user
exports.getBreeds = async (req, res) => {
  try {
    const breeds = await Breed.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(breeds);
  } catch (err) {
    console.error('FETCH BREEDS ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add a new breed
exports.addBreed = async (req, res) => {
  const { name, animalType } = req.body;
  try {
    const breed = await Breed.create({
      name,
      animalType: animalType || 'Goat',
      userId: req.user.id
    });
    res.status(201).json(breed);
  } catch (err) {
    console.error('ADD BREED ERROR:', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Breed name already exists' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a breed
exports.updateBreed = async (req, res) => {
  const { name, animalType } = req.body;
  try {
    const breed = await Breed.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!breed) {
      return res.status(404).json({ message: 'Breed not found' });
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
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!breed) {
      return res.status(404).json({ message: 'Breed not found' });
    }

    await breed.destroy();
    res.json({ message: 'Breed removed' });
  } catch (err) {
    console.error('DELETE BREED ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
