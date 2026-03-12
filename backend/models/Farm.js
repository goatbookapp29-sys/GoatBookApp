const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Farm = sequelize.define('Farm', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ownerEmployeeId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'owner_employee_id'
  }
}, {
  tableName: 'farms',
  timestamps: true,
  underscored: true
});

module.exports = Farm;
