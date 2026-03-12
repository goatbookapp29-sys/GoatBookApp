const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id'
  },
  employeeType: {
    type: DataTypes.ENUM('OWNER', 'EMPLOYEE', 'BUTCHER', 'AGENT'),
    allowNull: false,
    defaultValue: 'EMPLOYEE',
    field: 'employee_type'
  }
}, {
  tableName: 'employees',
  timestamps: true,
  underscored: true
});

module.exports = Employee;
