const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vaccine = sequelize.define('Vaccine', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  daysBetween: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'days_between'
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'vaccines',
  timestamps: true,
  underscored: true
});

module.exports = Vaccine;
