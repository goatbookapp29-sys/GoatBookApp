const { User } = require('../models');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('PROFILE FETCH ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateProfile = async (req, res) => {
  const { first_name, last_name, phone_number, bio, address, city } = req.body;

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({
      firstName: first_name,
      lastName: last_name,
      phoneNumber: phone_number,
      bio,
      address,
      city
    });

    res.json(user);
  } catch (err) {
    console.error('PROFILE UPDATE ERROR:', err);
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

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    // Update to new password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('CHANGE PASSWORD ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
