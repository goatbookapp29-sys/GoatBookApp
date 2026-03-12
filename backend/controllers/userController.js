const { User, Employee, FarmEmployee } = require('../models');
const sequelize = require('../config/database');

// @desc    Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Employee, as: 'employeeProfile' }]
    });
    res.json(user);
  } catch (err) {
    console.error('FETCH PROFILE ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update user profile
exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error('PROFILE UPDATE ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Owner creates an employee account
exports.createEmployee = async (req, res) => {
  const { name, phone, password, role } = req.body;
  const t = await sequelize.transaction();

  try {
    // 1. Authorization: Only OWNER can create employees
    if (req.employee.employeeType !== 'OWNER') {
      return res.status(403).json({ message: 'Only farm owners can create employees' });
    }

    // 2. Step 1: Create User login
    let user = await User.findOne({ where: { phone } }, { transaction: t });
    if (user) {
      await t.rollback();
      return res.status(400).json({ message: 'A user with this phone already exists' });
    }

    user = await User.create({ name, phone, password }, { transaction: t });

    // 3. Step 2: Create Employee identity
    const employee = await Employee.create({
      userId: user.id,
      employeeType: role || 'EMPLOYEE'
    }, { transaction: t });

    // 4. Step 3: Attach Employee to the CURRENT Farm of the owner
    if (!req.farmId) {
      await t.rollback();
      return res.status(400).json({ message: 'No active farm context' });
    }

    await FarmEmployee.create({
      farmId: req.farmId,
      employeeId: employee.id
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ message: 'Employee account created and linked to farm' });

  } catch (err) {
    if (t) await t.rollback();
    console.error('CREATE EMPLOYEE ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all employees for the current owner's farm
exports.getEmployees = async (req, res) => {
  try {
    if (!req.farmId) {
      return res.status(400).json({ message: 'No active farm context' });
    }

    // Get all employees linked to this farm
    const farmEmployees = await FarmEmployee.findAll({
      where: { farmId: req.farmId },
      include: [{
        model: Employee,
        include: [{ model: User, attributes: ['name', 'phone'] }]
      }]
    });

    const employees = farmEmployees.map(fe => fe.Employee);
    res.json(employees);
  } catch (err) {
    console.error('GET EMPLOYEES ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('CHANGE PASSWORD ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
