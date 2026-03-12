const { User } = require('../models');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { first_name, last_name, email, password, phone_number } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create user (Sequelize hooks in User.js will handle password hashing)
    user = await User.create({
      firstName: first_name,
      lastName: last_name,
      email,
      password,
      phoneNumber: phone_number
    });

    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (err) {
    console.error('REGISTRATION ERROR:', err);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Check password using model instance method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Create Token
    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '30d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { 
          id: user.id, 
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email 
        }});
      }
    );
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: 'Server Error: ' + err.message });
  }
};
