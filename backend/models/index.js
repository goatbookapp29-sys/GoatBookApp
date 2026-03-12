const User = require('./User');
const Employee = require('./Employee');
const Farm = require('./Farm');
const FarmEmployee = require('./FarmEmployee');
const Breed = require('./Breed');
const Animal = require('./Animal');
const Location = require('./Location');

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

Breed.belongsTo(Farm, { foreignKey: 'farmId' });
Animal.belongsTo(Farm, { foreignKey: 'farmId' });
Location.belongsTo(Farm, { foreignKey: 'farmId' });

// 5. Breed <-> Animal
Breed.hasMany(Animal, { foreignKey: 'breedId' });
Animal.belongsTo(Breed, { foreignKey: 'breedId' });

// 6. Location <-> Animal association
Location.hasMany(Animal, { foreignKey: 'locationId' });
Animal.belongsTo(Location, { foreignKey: 'locationId' });

// 7. Recursive Association for Location Hierarchy
Location.hasMany(Location, { as: 'subLocations', foreignKey: 'parentLocationId' });
Location.belongsTo(Location, { as: 'parentLocation', foreignKey: 'parentLocationId' });

// 8. Creator Trackers
Employee.hasMany(Breed, { foreignKey: 'createdByEmployeeId' });
Employee.hasMany(Animal, { foreignKey: 'createdByEmployeeId' });
Employee.hasMany(Location, { foreignKey: 'createdByEmployeeId', as: 'createdLocations' });

module.exports = {
  User,
  Employee,
  Farm,
  FarmEmployee,
  Breed,
  Animal,
  Location
};
