const { Animal, Breed, Location } = require('../models');
const { Op } = require('sequelize');

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
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Add a new animal
exports.addAnimal = async (req, res) => {
  const { 
    tagNumber, breedId, gender, color, birthDate, birthWeight, locationId,
    isBreeder, isQurbani, batchNo, acquisitionMethod,
    purchaseDate, purchasePrice, ageInMonths, femaleCondition,
    birthType, motherTagId, fatherTagId, remark,
    status, isReadyForSale, currentWeight, salePrice 
  } = req.body;
  
  try {
    if (!req.farmId) {
      return res.status(400).json({ message: 'No farm selected' });
    }

    // Verify breed belongs to this farm
    const breed = await Breed.findOne({ where: { id: breedId, farmId: req.farmId } });
    if (!breed) {
      return res.status(400).json({ message: 'Invalid breed selected for this farm' });
    }

    // TAG VALIDATIONS
    if (tagNumber) {
        const existingTag = await Animal.findOne({ where: { tagNumber, farmId: req.farmId } });
        if (existingTag) {
            return res.status(400).json({ message: 'Tag Number must be unique across the farm' });
        }
    }

    if (acquisitionMethod === 'BORN') {
        if (motherTagId && motherTagId === tagNumber) {
            return res.status(400).json({ message: 'Mother Tag ID cannot be the same as the Animal Tag ID' });
        }
        if (fatherTagId && fatherTagId === tagNumber) {
            return res.status(400).json({ message: 'Father Tag ID cannot be the same as the Animal Tag ID' });
        }
        if (motherTagId && fatherTagId && motherTagId === fatherTagId) {
            return res.status(400).json({ message: 'Mother and Father Tag IDs cannot be the same' });
        }
    }

    // Verify location belongs to this farm (if provided)
    if (locationId) {
        const location = await Location.findOne({ where: { id: locationId, farmId: req.farmId } });
        if (!location) {
            return res.status(400).json({ message: 'Invalid location selected for this farm' });
        }
    }

    // Formatting based on business rules
    const finalIsBreeder = gender === 'MALE' ? (isBreeder || false) : false;
    const finalIsQurbani = gender === 'MALE' ? (!finalIsBreeder && isQurbani || false) : false;

    const animal = await Animal.create({
      tagNumber,
      breedId,
      gender,
      color,
      birthDate,
      birthWeight,
      locationId: locationId || null,
      farmId: req.farmId,
      createdByUserId: req.user.id,
      isBreeder: finalIsBreeder,
      isQurbani: finalIsQurbani,
      batchNo,
      acquisitionMethod: acquisitionMethod || 'BORN',
      purchaseDate: acquisitionMethod === 'PURCHASED' ? purchaseDate : null,
      purchasePrice: acquisitionMethod === 'PURCHASED' ? purchasePrice : null,
      ageInMonths: acquisitionMethod === 'PURCHASED' ? ageInMonths : null,
      femaleCondition: gender === 'FEMALE' && acquisitionMethod === 'PURCHASED' ? femaleCondition : null,
      birthType,
      motherTagId: acquisitionMethod === 'BORN' ? motherTagId : null,
      fatherTagId: acquisitionMethod === 'BORN' ? fatherTagId : null,
      status: status || 'LIVE',
      isReadyForSale: isReadyForSale || false,
      currentWeight: isReadyForSale ? currentWeight : null,
      salePrice: isReadyForSale ? salePrice : null,
      remark
    });

    res.status(201).json(animal);
  } catch (err) {
    console.error('ADD ANIMAL ERROR:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
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
    console.error('FETCH LOCATIONS ERROR:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Update animal details
exports.updateAnimal = async (req, res) => {
  const { 
    tagNumber, breedId, gender, color, birthDate, birthWeight, locationId,
    isBreeder, isQurbani, batchNo, acquisitionMethod,
    purchaseDate, purchasePrice, ageInMonths, femaleCondition,
    birthType, motherTagId, fatherTagId, remark,
    status, isReadyForSale, currentWeight, salePrice 
  } = req.body;
  try {
    const animal = await Animal.findOne({
      where: { id: req.params.id, farmId: req.farmId }
    });

    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    // TAG VALIDATIONS
    if (tagNumber && tagNumber !== animal.tagNumber) {
        const existingTag = await Animal.findOne({ where: { tagNumber, farmId: req.farmId } });
        if (existingTag && existingTag.id !== animal.id) {
            return res.status(400).json({ message: 'Tag Number must be unique across the farm' });
        }
    }

    const currentAcqMethod = acquisitionMethod || animal.acquisitionMethod;
    if (currentAcqMethod === 'BORN') {
        const checkMotherTag = motherTagId || animal.motherTagId;
        const checkFatherTag = fatherTagId || animal.fatherTagId;
        
        // If they provided explicitly falsy or empty strings, it becomes null so we only check if present
        if (motherTagId && motherTagId === tagNumber) {
            return res.status(400).json({ message: 'Mother Tag ID cannot be the same as the Animal Tag ID' });
        }
        if (fatherTagId && fatherTagId === tagNumber) {
            return res.status(400).json({ message: 'Father Tag ID cannot be the same as the Animal Tag ID' });
        }
        if (motherTagId && fatherTagId && motherTagId === fatherTagId) {
            return res.status(400).json({ message: 'Mother and Father Tag IDs cannot be the same' });
        }
    }

    // Verify location if changing
    if (locationId) {
        const location = await Location.findOne({ where: { id: locationId, farmId: req.farmId } });
        if (!location) {
            return res.status(400).json({ message: 'Invalid location selected for this farm' });
        }
    }

    const finalIsBreeder = gender === 'MALE' ? (isBreeder || false) : false;
    const finalIsQurbani = gender === 'MALE' ? (!finalIsBreeder && isQurbani || false) : false;

    await animal.update({ 
        tagNumber, 
        breedId, 
        gender, 
        color,
        birthDate, 
        birthWeight,
        locationId: locationId || null,
        isBreeder: finalIsBreeder,
        isQurbani: finalIsQurbani,
        batchNo,
        acquisitionMethod: acquisitionMethod || animal.acquisitionMethod,
        purchaseDate: (acquisitionMethod || animal.acquisitionMethod) === 'PURCHASED' ? purchaseDate : null,
        purchasePrice: (acquisitionMethod || animal.acquisitionMethod) === 'PURCHASED' ? purchasePrice : null,
        ageInMonths: (acquisitionMethod || animal.acquisitionMethod) === 'PURCHASED' ? ageInMonths : null,
        femaleCondition: gender === 'FEMALE' && (acquisitionMethod || animal.acquisitionMethod) === 'PURCHASED' ? femaleCondition : null,
        birthType,
        motherTagId: (acquisitionMethod || animal.acquisitionMethod) === 'BORN' ? motherTagId : null,
        fatherTagId: (acquisitionMethod || animal.acquisitionMethod) === 'BORN' ? fatherTagId : null,
        status: status || animal.status,
        isReadyForSale: isReadyForSale !== undefined ? isReadyForSale : animal.isReadyForSale,
        currentWeight: (isReadyForSale !== undefined ? isReadyForSale : animal.isReadyForSale) ? currentWeight : null,
        salePrice: (isReadyForSale !== undefined ? isReadyForSale : animal.isReadyForSale) ? salePrice : null,
        remark,
        updatedByUserId: req.user.id
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

    // Check if this animal is registered as a parent (mother/father) for any other animal
    const parentCheck = await Animal.findOne({
      where: {
        farmId: req.farmId,
        [Op.or]: [
          { motherTagId: animal.tagNumber },
          { fatherTagId: animal.tagNumber }
        ]
      }
    });

    if (parentCheck) {
      return res.status(400).json({ 
        message: `Cannot delete animal ${animal.tagNumber} because it is registered as a parent of animal ${parentCheck.tagNumber}` 
      });
    }

    await animal.destroy();
    res.json({ message: 'Animal removed' });
  } catch (err) {
    console.error('DELETE ANIMAL ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
