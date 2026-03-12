const { Location, Animal, Breed } = require('../models');
const { Op } = require('sequelize');

// Helper to build hierarchical name: Current / Parent / Grandparent
const buildHierarchicalName = (location, allLocations) => {
  let name = location.name;
  let current = location;
  const visited = new Set([location.id]);
  
  while (current.parentLocationId) {
    if (visited.has(current.parentLocationId)) break; // Protection
    const parent = allLocations.find(l => l.id === current.parentLocationId);
    if (!parent) break;
    name += ` / ${parent.name}`;
    current = parent;
    visited.add(current.id);
  }
  return name;
};

// @desc    Get all locations for a farm
exports.getLocations = async (req, res) => {
  try {
    const allLocations = await Location.findAll({
      where: { farmId: req.farmId },
      raw: true // Simplify for path building
    });

    const locationsWithPaths = allLocations.map(loc => ({
      ...loc,
      displayName: buildHierarchicalName(loc, allLocations)
    }));

    // Sort by name for a better list experience
    locationsWithPaths.sort((a, b) => a.displayName.localeCompare(b.displayName));

    res.json(locationsWithPaths);
  } catch (err) {
    console.error('FETCH LOCATIONS ERROR:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Add a new location
exports.addLocation = async (req, res) => {
  const { code, name, type, parentLocationId } = req.body;
  try {
    const location = await Location.create({
      code,
      name,
      type,
      parentLocationId: parentLocationId || null,
      farmId: req.farmId,
      createdByEmployeeId: req.employee.id
    });
    res.status(201).json(location);
  } catch (err) {
    console.error('ADD LOCATION ERROR:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Update a location
exports.updateLocation = async (req, res) => {
  const { code, name, type, parentLocationId } = req.body;
  try {
    const location = await Location.findOne({
      where: { id: req.params.id, farmId: req.farmId }
    });

    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    // Prevent circular reference
    if (parentLocationId === req.params.id) {
        return res.status(400).json({ message: 'Location cannot be its own parent' });
    }

    await location.update({ code, name, type, parentLocationId: parentLocationId || null });
    res.json(location);
  } catch (err) {
    console.error('UPDATE LOCATION ERROR:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Delete a location
exports.deleteLocation = async (req, res) => {
  try {
    const location = await Location.findOne({
      where: { id: req.params.id, farmId: req.farmId }
    });

    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    // Check if animals are present in this location
    const animalCount = await Animal.count({ where: { locationId: location.id } });
    if (animalCount > 0) {
      return res.status(400).json({ message: 'Cannot delete location with animals present' });
    }

    // Check for child locations
    const childCount = await Location.count({ where: { parentLocationId: location.id } });
    if (childCount > 0) {
        return res.status(400).json({ message: 'Cannot delete location that has sub-locations' });
    }

    await location.destroy();
    res.json({ message: 'Location removed' });
  } catch (err) {
    console.error('DELETE LOCATION ERROR:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Get animal distribution at a location grouped by breed
exports.getLocationStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if location exists and belongs to farm
    const location = await Location.findOne({ where: { id, farmId: req.farmId } });
    if (!location) return res.status(404).json({ message: 'Location not found' });

    // Fetch animals at this location with their breed info
    const animals = await Animal.findAll({
      where: { locationId: id, farmId: req.farmId },
      include: [{ model: Breed, attributes: ['name', 'animalType'] }]
    });

    // Group animals by breed
    const distribution = {};
    animals.forEach(animal => {
      const breedName = animal.Breed?.name || 'Unknown Breed';
      const breedId = animal.breedId;
      
      if (!distribution[breedId]) {
        distribution[breedId] = {
          breedId,
          breedName,
          count: 0,
          animals: []
        };
      }
      
      distribution[breedId].count += 1;
      distribution[breedId].animals.push({
          id: animal.id,
          tagNumber: animal.tagNumber,
          gender: animal.gender
      });
    });

    res.json({
      location,
      totalAnimals: animals.length,
      distribution: Object.values(distribution)
    });
  } catch (err) {
    console.error('GET LOCATION STATS ERROR:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};
