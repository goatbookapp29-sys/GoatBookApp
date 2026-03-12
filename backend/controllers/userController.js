const { User, Employee, Farm, FarmEmployee } = require('../models');
const sequelize = require('../config/database');

// @desc    Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{ 
        model: Employee, 
        as: 'employeeProfile',
        include: [{ model: Farm, as: 'farms', through: { attributes: [] } }]
      }]
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
// Flow: Create User -> Create Employee ID -> Link to Farm
exports.createEmployee = async (req, res) => {
  const { name, email, password, role } = req.body;
  const t = await sequelize.transaction();

  try {
    // 1. Authorization: Only OWNER can create employees
    if (req.employee.employeeType !== 'OWNER') {
      return res.status(403).json({ message: 'Only farm owners can create employees' });
    }

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and temporary password are required' });
    }

    // 2. Step 1: Create User login
    let user = await User.findOne({ where: { email } }, { transaction: t });
    if (user) {
      await t.rollback();
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    user = await User.create({ name, email, password }, { transaction: t });

    // 3. Step 2: Create Employee identity
    const employee = await Employee.create({
      userId: user.id,
      employeeType: role || 'EMPLOYEE'
    }, { transaction: t });

    // 4. Step 3: Attach Employee to the CURRENT Farm
    if (!req.farmId) {
      await t.rollback();
      return res.status(400).json({ message: 'No active farm context' });
    }

    await FarmEmployee.create({
      farmId: req.farmId,
      employeeId: employee.id
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ message: 'Employee created successfully' });

  } catch (err) {
    if (t) await t.rollback();
    console.error('CREATE EMPLOYEE ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update employee (Owner only)
exports.updateEmployee = async (req, res) => {
  const { name, role } = req.body;
  try {
    if (req.employee.employeeType !== 'OWNER') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const employee = await Employee.findByPk(req.params.id, {
      include: [{ model: User }]
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Role Protection: Check if this employee is a primary owner of any farm
    const ownedFarm = await Farm.findOne({ where: { ownerEmployeeId: employee.id } });
    if (ownedFarm && role && role !== 'OWNER') {
      return res.status(403).json({ message: 'The primary owner role cannot be changed' });
    }

    // Update Employee Type
    if (role) employee.employeeType = role;
    await employee.save();

    // Update Linked User Name
    if (name) {
      const user = await User.findByPk(employee.userId);
      user.name = name;
      await user.save();
    }

    res.json({ message: 'Employee updated successfully' });
  } catch (err) {
    console.error('UPDATE EMPLOYEE ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Reset Employee Password (Owner only)
exports.resetEmployeePassword = async (req, res) => {
  const { newPassword } = req.body;
  try {
    if (req.employee.employeeType !== 'OWNER') {
      return res.status(403).json({ message: 'Only owners can reset staff passwords' });
    }

    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const user = await User.findByPk(employee.userId);
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all employees for the active farm
exports.getEmployees = async (req, res) => {
  try {
    if (!req.farmId) {
      return res.status(400).json({ message: 'No farm selected' });
    }

    const farmEmployees = await FarmEmployee.findAll({
      where: { farmId: req.farmId },
      include: [{
        model: Employee,
        include: [{ model: User, attributes: ['id', 'name', 'email'] }]
      }]
    });

    res.json(farmEmployees.map(fe => ({
      id: fe.Employee.id,
      name: fe.Employee.User.name,
      email: fe.Employee.User.email,
      role: fe.Employee.employeeType
    })));
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
