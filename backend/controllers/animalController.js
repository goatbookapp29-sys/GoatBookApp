const prisma = require('../config/prisma');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const logError = (error, context) => {
  const logMsg = `\n--- ERROR [${new Date().toISOString()}] ---\nContext: ${context}\nMessage: ${error.message}\nStack: ${error.stack}\n`;
  fs.appendFileSync('/tmp/animal_errors.log', logMsg);
};

// @desc    Get all animals for the current farm
exports.getAnimals = async (req, res) => {
  try {
    if (!req.farmId) {
      return res.status(400).json({ message: 'No farm selected' });
    }

    const animals = await prisma.animals.findMany({
      where: { farm_id: req.farmId },
      include: {
        breeds: { select: { name: true, animal_type: true } },
        locations: { select: { name: true, code: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    // Map to camelCase response format for frontend compatibility
    const mapped = animals.map(a => ({
      id: a.id,
      tagNumber: a.tag_number,
      color: a.color,
      breedId: a.breed_id,
      locationId: a.location_id,
      farmId: a.farm_id,
      gender: a.gender,
      birthDate: a.birth_date,
      birthWeight: a.birth_weight,
      animalType: a.animal_type,
      isBreeder: a.is_breeder,
      isQurbani: a.is_qurbani,
      batchNo: a.batch_no,
      motherTagId: a.mother_tag_id,
      fatherTagId: a.father_tag_id,
      acquisitionMethod: a.acquisition_method,
      purchaseDate: a.purchase_date,
      purchasePrice: a.purchase_price,
      ageInMonths: a.age_in_months,
      femaleCondition: a.female_condition,
      birthType: a.birth_type,
      status: a.status,
      isReadyForSale: a.is_ready_for_sale,
      salePrice: a.sale_price,
      currentWeight: a.current_weight,
      remark: a.remark,
      createdByUserId: a.created_by_user_id,
      updatedByUserId: a.updated_by_user_id,
      createdAt: a.created_at,
      updatedAt: a.updated_at,
      Breed: a.breeds ? { name: a.breeds.name, animalType: a.breeds.animal_type } : null,
      Location: a.locations ? { name: a.locations.name, code: a.locations.code } : null
    }));

    res.json(mapped);
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

    // Verify breed belongs to this farm (or is a global default breed)
    const breed = await prisma.breeds.findFirst({ 
      where: { 
        id: breedId,
        OR: [
          { farm_id: req.farmId },
          { is_default: true }
        ]
      } 
    });
    if (!breed) {
      return res.status(400).json({ message: 'Invalid breed selected' });
    }

    // TAG VALIDATIONS
    if (tagNumber) {
        const existingTag = await prisma.animals.findFirst({ where: { tag_number: tagNumber, farm_id: req.farmId } });
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
        const location = await prisma.locations.findFirst({ where: { id: locationId, farm_id: req.farmId } });
        if (!location) {
            return res.status(400).json({ message: 'Invalid location selected for this farm' });
        }
    }

    // Formatting based on business rules
    const finalIsBreeder = gender === 'MALE' ? (isBreeder || false) : false;
    const finalIsQurbani = gender === 'MALE' ? (!finalIsBreeder && isQurbani || false) : false;

    const now = new Date();
    const animal = await prisma.animals.create({
      data: {
        id: uuidv4(),
        tag_number: tagNumber,
        breed_id: breedId,
        gender,
        color,
        birth_date: birthDate ? new Date(birthDate) : null,
        birth_weight: birthWeight || null,
        location_id: locationId || null,
        farm_id: req.farmId,
        created_by_user_id: req.user.id,
        is_breeder: finalIsBreeder,
        is_qurbani: finalIsQurbani,
        batch_no: batchNo,
        acquisition_method: acquisitionMethod || 'BORN',
        purchase_date: acquisitionMethod === 'PURCHASED' && purchaseDate ? new Date(purchaseDate) : null,
        purchase_price: acquisitionMethod === 'PURCHASED' ? purchasePrice : null,
        age_in_months: acquisitionMethod === 'PURCHASED' ? ageInMonths : null,
        female_condition: gender === 'FEMALE' && acquisitionMethod === 'PURCHASED' ? femaleCondition : null,
        birth_type: birthType || null,
        mother_tag_id: acquisitionMethod === 'BORN' ? motherTagId : null,
        father_tag_id: acquisitionMethod === 'BORN' ? fatherTagId : null,
        status: status || 'LIVE',
        is_ready_for_sale: isReadyForSale || false,
        current_weight: isReadyForSale ? currentWeight : null,
        sale_price: isReadyForSale ? salePrice : null,
        remark,
        created_at: now,
        updated_at: now
      }
    });

    // Return camelCase format
    res.status(201).json({
      id: animal.id,
      tagNumber: animal.tag_number,
      breedId: animal.breed_id,
      gender: animal.gender,
      color: animal.color,
      birthDate: animal.birth_date,
      birthWeight: animal.birth_weight,
      locationId: animal.location_id,
      farmId: animal.farm_id,
      isBreeder: animal.is_breeder,
      isQurbani: animal.is_qurbani,
      batchNo: animal.batch_no,
      acquisitionMethod: animal.acquisition_method,
      purchaseDate: animal.purchase_date,
      purchasePrice: animal.purchase_price,
      ageInMonths: animal.age_in_months,
      femaleCondition: animal.female_condition,
      birthType: animal.birth_type,
      motherTagId: animal.mother_tag_id,
      fatherTagId: animal.father_tag_id,
      status: animal.status,
      isReadyForSale: animal.is_ready_for_sale,
      currentWeight: animal.current_weight,
      salePrice: animal.sale_price,
      remark: animal.remark,
      createdAt: animal.created_at,
      updatedAt: animal.updated_at
    });
  } catch (err) {
    logError(err, 'addAnimal');
    console.error('ADD ANIMAL ERROR [FULL]:', err);
    res.status(500).json({ 
      message: 'Server Error', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
};

// @desc    Get single animal details
exports.getAnimal = async (req, res) => {
  try {
    const animal = await prisma.animals.findFirst({
      where: { id: req.params.id, farm_id: req.farmId },
      include: {
        breeds: true,
        locations: true
      }
    });

    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    res.json({
      id: animal.id,
      tagNumber: animal.tag_number,
      color: animal.color,
      breedId: animal.breed_id,
      locationId: animal.location_id,
      farmId: animal.farm_id,
      gender: animal.gender,
      birthDate: animal.birth_date,
      birthWeight: animal.birth_weight,
      animalType: animal.animal_type,
      isBreeder: animal.is_breeder,
      isQurbani: animal.is_qurbani,
      batchNo: animal.batch_no,
      motherTagId: animal.mother_tag_id,
      fatherTagId: animal.father_tag_id,
      acquisitionMethod: animal.acquisition_method,
      purchaseDate: animal.purchase_date,
      purchasePrice: animal.purchase_price,
      ageInMonths: animal.age_in_months,
      femaleCondition: animal.female_condition,
      birthType: animal.birth_type,
      status: animal.status,
      isReadyForSale: animal.is_ready_for_sale,
      salePrice: animal.sale_price,
      currentWeight: animal.current_weight,
      remark: animal.remark,
      createdAt: animal.created_at,
      updatedAt: animal.updated_at,
      Breed: animal.breeds,
      Location: animal.locations
    });
  } catch (err) {
    console.error('FETCH ANIMAL ERROR:', err);
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
    const animal = await prisma.animals.findFirst({
      where: { id: req.params.id, farm_id: req.farmId }
    });

    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    // TAG VALIDATIONS
    if (tagNumber && tagNumber !== animal.tag_number) {
        const existingTag = await prisma.animals.findFirst({ where: { tag_number: tagNumber, farm_id: req.farmId } });
        if (existingTag && existingTag.id !== animal.id) {
            return res.status(400).json({ message: 'Tag Number must be unique across the farm' });
        }
    }

    const currentAcqMethod = acquisitionMethod || animal.acquisition_method;
    if (currentAcqMethod === 'BORN') {
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
        const location = await prisma.locations.findFirst({ where: { id: locationId, farm_id: req.farmId } });
        if (!location) {
            return res.status(400).json({ message: 'Invalid location selected for this farm' });
        }
    }

    // Verify breed if changing
    if (breedId) {
        const breedCheck = await prisma.breeds.findFirst({ 
          where: { 
            id: breedId,
            OR: [
              { farm_id: req.farmId },
              { is_default: true }
            ]
          } 
        });
        if (!breedCheck) {
            return res.status(400).json({ message: 'Invalid breed selected' });
        }
    }

    const finalIsBreeder = gender === 'MALE' ? (isBreeder || false) : false;
    const finalIsQurbani = gender === 'MALE' ? (!finalIsBreeder && isQurbani || false) : false;
    const finalReadyForSale = isReadyForSale !== undefined ? isReadyForSale : animal.is_ready_for_sale;

    const updated = await prisma.animals.update({
      where: { id: req.params.id },
      data: {
        tag_number: tagNumber,
        breed_id: breedId,
        gender,
        color,
        birth_date: birthDate ? new Date(birthDate) : null,
        birth_weight: birthWeight,
        location_id: locationId || null,
        is_breeder: finalIsBreeder,
        is_qurbani: finalIsQurbani,
        batch_no: batchNo,
        acquisition_method: currentAcqMethod,
        purchase_date: currentAcqMethod === 'PURCHASED' && purchaseDate ? new Date(purchaseDate) : null,
        purchase_price: currentAcqMethod === 'PURCHASED' ? purchasePrice : null,
        age_in_months: currentAcqMethod === 'PURCHASED' ? ageInMonths : null,
        female_condition: gender === 'FEMALE' && currentAcqMethod === 'PURCHASED' ? femaleCondition : null,
        birth_type: birthType || null,
        mother_tag_id: currentAcqMethod === 'BORN' ? motherTagId : null,
        father_tag_id: currentAcqMethod === 'BORN' ? fatherTagId : null,
        status: status || animal.status,
        is_ready_for_sale: finalReadyForSale,
        current_weight: finalReadyForSale ? currentWeight : null,
        sale_price: finalReadyForSale ? salePrice : null,
        remark,
        updated_by_user_id: req.user.id,
        updated_at: new Date()
      }
    });

    res.json({
      id: updated.id,
      tagNumber: updated.tag_number,
      breedId: updated.breed_id,
      gender: updated.gender,
      status: updated.status,
      updatedAt: updated.updated_at
    });
  } catch (err) {
    console.error('UPDATE ANIMAL ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete an animal
exports.deleteAnimal = async (req, res) => {
  try {
    const animal = await prisma.animals.findFirst({
      where: { id: req.params.id, farm_id: req.farmId }
    });

    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    // Check if this animal is registered as a parent (mother/father) for any other animal
    const parentCheck = await prisma.animals.findFirst({
      where: {
        farm_id: req.farmId,
        OR: [
          { mother_tag_id: animal.tag_number },
          { father_tag_id: animal.tag_number }
        ]
      }
    });

    if (parentCheck) {
      return res.status(400).json({ 
        message: `Cannot delete animal ${animal.tag_number} because it is registered as a parent of animal ${parentCheck.tag_number}` 
      });
    }

    await prisma.animals.delete({ where: { id: req.params.id } });
    res.json({ message: 'Animal removed' });
  } catch (err) {
    console.error('DELETE ANIMAL ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
