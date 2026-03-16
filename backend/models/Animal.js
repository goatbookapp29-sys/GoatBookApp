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
  color: {
    type: DataTypes.STRING,
    allowNull: true
  },
  breedId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'breed_id'
  },
  locationId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'location_id'
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
  birthWeight: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
    field: 'birth_weight'
  },
  animalType: {
    type: DataTypes.STRING,
    defaultValue: 'GOAT',
    field: 'animal_type'
  },
  isBreeder: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_breeder'
  },
  isQurbani: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_qurbani'
  },
  batchNo: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'batch_no'
  },
  motherTagId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'mother_tag_id'
  },
  fatherTagId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'father_tag_id'
  },
  acquisitionMethod: {
    type: DataTypes.ENUM('BORN', 'PURCHASED'),
    allowNull: false,
    defaultValue: 'BORN',
    field: 'acquisition_method'
  },
  purchaseDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'purchase_date'
  },
  purchasePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'purchase_price'
  },
  ageInMonths: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'age_in_months'
  },
  femaleCondition: {
    type: DataTypes.ENUM('MATED', 'PREGNANT', 'NONE'),
    allowNull: true,
    field: 'female_condition'
  },
  birthType: {
    type: DataTypes.ENUM('SINGLE', 'TWIN', 'TRIPLET', 'QUADRUPLET'),
    allowNull: true,
    field: 'birth_type'
  },
  remark: {
    type: DataTypes.TEXT,
    allowNull: true
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
