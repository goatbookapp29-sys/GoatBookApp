const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Breed = sequelize.define('Breed', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  animalType: { // Goat, Sheep, etc.
    type: DataTypes.STRING,
    defaultValue: 'Goat',
    field: 'animal_type'
  },
  farmId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'farm_id'
  },
  createdByUserId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'created_by_user_id'
  },
  updatedByUserId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'updated_by_user_id'
  }
}, {
  tableName: 'breeds',
  timestamps: true,
  underscored: true
});

module.exports = Breed;
