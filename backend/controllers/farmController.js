const prisma = require('../config/prisma');

// @desc    Get current farm details
// @route   GET /api/farms/current
exports.getFarmDetails = async (req, res) => {
  try {
    if (!req.farmId) {
      return res.status(400).json({ message: 'No farm selected' });
    }

    const farm = await prisma.farms.findUnique({ where: { id: req.farmId } });
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    res.json({
      id: farm.id,
      name: farm.name,
      location: farm.location,
      ownerEmployeeId: farm.owner_employee_id,
      createdAt: farm.created_at,
      updatedAt: farm.updated_at
    });
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
    if (req.employee.employee_type !== 'OWNER') {
      return res.status(403).json({ message: 'Only farm owners can update farm details' });
    }

    const farm = await prisma.farms.findUnique({ where: { id: req.farmId } });
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    const updated = await prisma.farms.update({
      where: { id: req.farmId },
      data: {
        name: name || farm.name,
        location: location !== undefined ? location : farm.location,
        updated_by_user_id: req.user.id,
        updated_at: new Date()
      }
    });

    res.json({
      id: updated.id,
      name: updated.name,
      location: updated.location,
      updatedAt: updated.updated_at
    });
  } catch (err) {
    console.error('UPDATE FARM ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
