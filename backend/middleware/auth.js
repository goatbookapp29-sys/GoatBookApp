const jwt = require('jsonwebtoken');
const { User, Employee, FarmEmployee } = require('../models');

module.exports = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  const farmId = req.header('X-Farm-ID');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Fetch user and their employee identity
    const user = await User.findByPk(decoded.id, {
      include: [{ model: Employee, as: 'employeeProfile' }]
    });

    if (!user || !user.employeeProfile) {
      return res.status(401).json({ message: 'User or Employee profile not found' });
    }

    req.user = user;
    req.employee = user.employeeProfile;

    // If a farmId is provided, verify the employee belongs to that farm
    if (farmId) {
      const membership = await FarmEmployee.findOne({
        where: { farmId, employeeId: user.employeeProfile.id }
      });

      if (!membership) {
        return res.status(403).json({ message: 'Access denied: You do not belong to this farm' });
      }
      req.farmId = farmId;
    }

    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
