const { Animal, Breed, VaccinationRecord } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

exports.getOverallReport = async (req, res) => {
  try {
    const farmId = req.farmId;
    if (!farmId) return res.status(400).json({ message: 'No farm selected' });

    // Fetch all animals for the farm
    const animals = await Animal.findAll({
      where: { farmId, status: 'LIVE' },
      attributes: ['gender', 'birthDate', 'isBreeder', 'femaleCondition']
    });

    const now = new Date();
    
    // Result object
    const stats = {
      total: animals.length,
      male: 0,
      female: 0,
      breeder: 0,
      pregnant: 0,
      kids0_3: 0,
      kids3_6: 0,
      kids6_9: 0
    };

    animals.forEach(animal => {
      // Basic Gender
      if (animal.gender === 'MALE') stats.male++;
      if (animal.gender === 'FEMALE') {
        stats.female++;
        if (animal.femaleCondition === 'PREGNANT') stats.pregnant++;
      }
      
      // Breeder
      if (animal.isBreeder) stats.breeder++;

      // Age Breakdown
      if (animal.birthDate) {
        const birthDate = new Date(animal.birthDate);
        const ageInMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
        
        if (ageInMonths >= 0 && ageInMonths < 3) stats.kids0_3++;
        else if (ageInMonths >= 3 && ageInMonths < 6) stats.kids3_6++;
        else if (ageInMonths >= 6 && ageInMonths < 9) stats.kids6_9++;
      }
    });

    res.json(stats);
  } catch (err) {
    console.error('REPORT ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
