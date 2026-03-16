const User = require('./User');
const Employee = require('./Employee');
const Farm = require('./Farm');
const FarmEmployee = require('./FarmEmployee');
const Breed = require('./Breed');
const Animal = require('./Animal');
const Location = require('./Location');
const Weight = require('./Weight');

// 1. User <-> Employee (1:1 per profile)
User.hasOne(Employee, { foreignKey: 'userId', as: 'employeeProfile' });
Employee.belongsTo(User, { foreignKey: 'userId' });

// 2. Farm <-> Employee (M:M via FarmEmployee)
Farm.belongsToMany(Employee, { through: FarmEmployee, foreignKey: 'farmId', as: 'staff' });
Employee.belongsToMany(Farm, { through: FarmEmployee, foreignKey: 'employeeId', as: 'farms' });

// Explicit junction associations for direct querying
Farm.hasMany(FarmEmployee, { foreignKey: 'farmId' });
FarmEmployee.belongsTo(Farm, { foreignKey: 'farmId' });
Employee.hasMany(FarmEmployee, { foreignKey: 'employeeId' });
FarmEmployee.belongsTo(Employee, { foreignKey: 'employeeId' });

// 3. Farm <-> Owner (1:1 link for management)
Farm.belongsTo(Employee, { foreignKey: 'ownerEmployeeId', as: 'owner' });

// 4. Farm Scoped Data
Farm.hasMany(Breed, { foreignKey: 'farmId' });
Farm.hasMany(Animal, { foreignKey: 'farmId' });
Farm.hasMany(Location, { foreignKey: 'farmId' });
Farm.hasMany(Weight, { foreignKey: 'farmId' });

Breed.belongsTo(Farm, { foreignKey: 'farmId' });
Animal.belongsTo(Farm, { foreignKey: 'farmId' });
Location.belongsTo(Farm, { foreignKey: 'farmId' });
Weight.belongsTo(Farm, { foreignKey: 'farmId' });

// 5. Breed <-> Animal
Breed.hasMany(Animal, { foreignKey: 'breedId' });
Animal.belongsTo(Breed, { foreignKey: 'breedId' });

// 6. Location <-> Animal association
Location.hasMany(Animal, { foreignKey: 'locationId' });
Animal.belongsTo(Location, { foreignKey: 'locationId' });

// 7. Animal <-> Weight association
Animal.hasMany(Weight, { foreignKey: 'animalId', as: 'weights' });
Weight.belongsTo(Animal, { foreignKey: 'animalId' });

// 8. Recursive Association for Location Hierarchy
Location.hasMany(Location, { as: 'subLocations', foreignKey: 'parentLocationId' });
Location.belongsTo(Location, { as: 'parentLocation', foreignKey: 'parentLocationId' });

// 9. Creator/Updater Trackers (Audit)
User.hasMany(Animal, { foreignKey: 'createdByUserId', as: 'createdAnimals' });
User.hasMany(Animal, { foreignKey: 'updatedByUserId', as: 'updatedAnimals' });
Animal.belongsTo(User, { foreignKey: 'createdByUserId', as: 'creator' });
Animal.belongsTo(User, { foreignKey: 'updatedByUserId', as: 'updater' });

User.hasMany(Breed, { foreignKey: 'createdByUserId', as: 'createdBreeds' });
User.hasMany(Breed, { foreignKey: 'updatedByUserId', as: 'updatedBreeds' });
Breed.belongsTo(User, { foreignKey: 'createdByUserId', as: 'creator' });
Breed.belongsTo(User, { foreignKey: 'updatedByUserId', as: 'updater' });

User.hasMany(Location, { foreignKey: 'createdByUserId', as: 'createdLocations' });
User.hasMany(Location, { foreignKey: 'updatedByUserId', as: 'updatedLocations' });
Location.belongsTo(User, { foreignKey: 'createdByUserId', as: 'creator' });
Location.belongsTo(User, { foreignKey: 'updatedByUserId', as: 'updater' });

User.hasMany(Weight, { foreignKey: 'createdByUserId', as: 'createdWeights' });
User.hasMany(Weight, { foreignKey: 'updatedByUserId', as: 'updatedWeights' });
Weight.belongsTo(User, { foreignKey: 'createdByUserId', as: 'creator' });
Weight.belongsTo(User, { foreignKey: 'updatedByUserId', as: 'updater' });

module.exports = {
  User,
  Employee,
  Farm,
  FarmEmployee,
  Breed,
  Animal,
  Location,
  Weight
};
