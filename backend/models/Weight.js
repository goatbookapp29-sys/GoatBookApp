const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Weight = sequelize.define('Weight', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  animalId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'animal_id'
  },
  farmId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'farm_id'
  },
  weight: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: false
  },
  height: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  tagNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'tag_number'
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'weights',
  timestamps: true,
  underscored: true
});

module.exports = Weight;
