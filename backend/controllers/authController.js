const { User, Employee, Farm, FarmEmployee } = require('../models');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');

// @desc    Owner Registration Flow
// @route   POST api/auth/register
exports.register = async (req, res) => {
  const { name, email, phone, password, farmName, farmLocation } = req.body;

  // Transaction ensures either everything is created or nothing is (prevents partial data)
  const t = await sequelize.transaction();

  try {
    // 1. Check if user already exists
    let user = await User.findOne({ where: { phone } }, { transaction: t });
    if (user) {
      await t.rollback();
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }

    // 2. Step 1: Create User
    user = await User.create({
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

    // Commit Transaction
    await t.commit();

    // Generate Token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      farm: {
        id: farm.id,
        name: farm.name
      }
    });

  } catch (err) {
    await t.rollback();
    console.error('REGISTRATION ERROR:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Employee/Owner Login Flow
// @route   POST api/auth/login
exports.login = async (req, res) => {
  const { email, phone, password } = req.body;

  try {
    // Auth by Email OR Phone
    const user = await User.findOne({
      where: email ? { email } : { phone },
      include: [{
        model: Employee,
        as: 'employeeProfile',
        include: [{
          model: Farm,
          as: 'farms',
          through: { attributes: [] } // Hide junction table data
        }]
      }]
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.employeeProfile.employeeType
      },
      farms: user.employeeProfile.farms // Return list of available farms
    });

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
