const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Animal = sequelize.define('Animal', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tagNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'tag_number'
  },
  breedId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'breed_id'
  },
  farmId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'farm_id'
  },
  gender: {
    type: DataTypes.ENUM('MALE', 'FEMALE'),
    allowNull: false
  },
  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'birth_date'
  },
  createdByEmployeeId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'created_by_employee_id'
  }
}, {
  tableName: 'animals',
  timestamps: true,
  underscored: true
});

module.exports = Animal;
