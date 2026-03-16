const { Farm } = require('../models');

// @desc    Get current farm details
// @route   GET /api/farms/current
exports.getFarmDetails = async (req, res) => {
  try {
    if (!req.farmId) {
      return res.status(400).json({ message: 'No farm selected' });
    }

    const farm = await Farm.findByPk(req.farmId);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    res.json(farm);
  } catch (err) {
    console.error('GET FARM ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update farm details
// @route   PUT /api/farms/current
exports.updateFarmDetails = async (req, res) => {
  const { name, location } = req.body;
  try {
    if (!req.farmId) {
      return res.status(400).json({ message: 'No farm selected' });
    }

    // Authorization: Only OWNER can update farm details
    if (req.employee.employeeType !== 'OWNER') {
      return res.status(403).json({ message: 'Only farm owners can update farm details' });
    }

    const farm = await Farm.findByPk(req.farmId);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    farm.name = name || farm.name;
    farm.location = location !== undefined ? location : farm.location;
    farm.updatedByUserId = req.user.id;

    await farm.save();
    res.json(farm);
  } catch (err) {
    console.error('UPDATE FARM ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
