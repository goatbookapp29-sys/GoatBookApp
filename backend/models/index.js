const User = require('./User');
const Breed = require('./Breed');

// Define Associations
User.hasMany(Breed, { foreignKey: 'userId', as: 'breeds' });
Breed.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  Breed
};
