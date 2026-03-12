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
  }
}, {
  tableName: 'farm_employees',
  timestamps: true,
  underscored: true
});

module.exports = FarmEmployee;
