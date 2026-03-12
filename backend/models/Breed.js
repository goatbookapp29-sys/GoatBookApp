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
  animalType: { // Added: Goat, Sheep, etc.
    type: DataTypes.ENUM('Goat', 'Sheep', 'Other'),
    defaultValue: 'Goat',
    field: 'animal_type'
  },
  farmId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'farm_id'
  },
  createdByEmployeeId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'created_by_employee_id'
  }
}, {
  tableName: 'breeds',
  timestamps: true,
  underscored: true
});

module.exports = Breed;
