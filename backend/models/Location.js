const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Location = sequelize.define('Location', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING, // Vendor, Customer, Virtual, Internal, Loss
    allowNull: false,
    defaultValue: 'Internal Location'
  },
  parentLocationId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'parent_location_id'
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
  tableName: 'locations',
  timestamps: true,
  underscored: true
});

module.exports = Location;
