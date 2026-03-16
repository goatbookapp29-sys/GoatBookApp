const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FarmEmployee = sequelize.define('FarmEmployee', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  farmId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'farm_id'
  },
  employeeId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'employee_id'
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
  tableName: 'farm_employees',
  timestamps: true,
  underscored: true
});

module.exports = FarmEmployee;
