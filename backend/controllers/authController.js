const { User, Employee, Farm, FarmEmployee } = require('../models');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');

// @desc    Owner Registration Flow
// @route   POST api/auth/register
exports.register = async (req, res) => {
  const { name, email, phone, password, farmName, farmLocation } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const t = await sequelize.transaction();

  try {
    // 1. Check if user already exists (Check both email and phone)
    let userExists = await User.findOne({ 
      where: { 
        [sequelize.Sequelize.Op.or]: [{ email }, { phone }] 
      }
    }, { transaction: t });

    if (userExists) {
      await t.rollback();
      return res.status(400).json({ message: 'User with this email or phone already exists' });
    }

    // 2. Step 1: Create User
    const user = await User.create({
      name,
      email,
      phone,
      password
    }, { transaction: t });

    // 3. Step 2: Create Employee record with type OWNER
    const employee = await Employee.create({
      userId: user.id,
      employeeType: 'OWNER'
    }, { transaction: t });

    // 4. Step 3: Create Farm
    const farm = await Farm.create({
      name: farmName,
      location: farmLocation,
      ownerEmployeeId: employee.id
    }, { transaction: t });

    // 5. Step 4: Link Owner to Farm
    await FarmEmployee.create({
      farmId: farm.id,
      employeeId: employee.id
    }, { transaction: t });

    await t.commit();

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '365d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      farm: {
        id: farm.id,
        name: farm.name
      }
    });

  } catch (err) {
    if (t) await t.rollback();
    console.error('REGISTRATION ERROR:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Email-only Login Flow
// @route   POST api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await User.findOne({
      where: { email },
      include: [{
        model: Employee,
        as: 'employeeProfile',
        include: [{
          model: Farm,
          as: 'farms',
          through: { attributes: [] }
        }]
      }]
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '365d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.employeeProfile.employeeType
      },
      farms: user.employeeProfile.farms
    });

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
