const User = require('./User');
const Employee = require('./Employee');
const Farm = require('./Farm');
const FarmEmployee = require('./FarmEmployee');
const Breed = require('./Breed');
const Animal = require('./Animal');

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

// 4. Farm <-> Breed & Animal (Scoped data)
Farm.hasMany(Breed, { foreignKey: 'farmId' });
Farm.hasMany(Animal, { foreignKey: 'farmId' });
Breed.belongsTo(Farm, { foreignKey: 'farmId' });
Animal.belongsTo(Farm, { foreignKey: 'farmId' });

// 5. Breed <-> Animal
Breed.hasMany(Animal, { foreignKey: 'breedId' });
Animal.belongsTo(Breed, { foreignKey: 'breedId' });

// 6. Creator Trackers
Employee.hasMany(Breed, { foreignKey: 'createdByEmployeeId' });
Employee.hasMany(Animal, { foreignKey: 'createdByEmployeeId' });

module.exports = {
  User,
  Employee,
  Farm,
  FarmEmployee,
  Breed,
  Animal
};
