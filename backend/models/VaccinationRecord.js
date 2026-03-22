const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VaccinationRecord = sequelize.define('VaccinationRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  vaccineId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'vaccine_id'
  },
  animalId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'animal_id'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  validTill: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'valid_till'
  },
  nextDueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'next_due_date'
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
  tableName: 'vaccination_records',
  timestamps: true,
  underscored: true
});

module.exports = VaccinationRecord;
