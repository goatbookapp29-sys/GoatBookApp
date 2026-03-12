const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Breed = sequelize.define('Breed', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  animalType: {
    type: DataTypes.ENUM('Goat', 'Sheep'),
    defaultValue: 'Goat',
    field: 'animal_type'
  },
  description: {
    type: DataTypes.TEXT
  },
  userId: {
    type: DataTypes.UUID,
    field: 'user_id',
    allowNull: false
  }
}, {
  tableName: 'breeds',
  timestamps: true,
  underscored: true
});

module.exports = Breed;
