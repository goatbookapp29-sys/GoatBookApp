import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import { Power, Ghost, Users, Bug, Settings, MapPin, Scale } from 'lucide-react-native';
import api, { setAuthToken, setSelectedFarm } from '../api';
import styles from './DashboardScreen.styles';
import { useFocusEffect } from '@react-navigation/native';
import { getFromCache, saveToCache } from '../utils/cache';

const DashboardScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [farmName, setFarmName] = useState('Loading...');
  const [stats, setStats] = useState({ breeds: 0, employees: 0, animals: 0, locations: 0, weights: 0 });
  const [loading, setLoading] = useState(true);

  const tiles = [
    { id: '1', title: 'Breed', icon: <Ghost color={COLORS.primary} size={32} />, count: stats.breeds.toString().padStart(2, '0'), screen: 'BreedList' },
    { id: '2', title: 'Employee', icon: <Users color={COLORS.primary} size={32} />, count: stats.employees.toString().padStart(2, '0'), screen: 'EmployeeList' },
    { id: '3', title: 'Animal', icon: <Bug color={COLORS.primary} size={32} />, count: stats.animals.toString(), screen: 'AnimalList' },
    { id: '5', title: 'Weight', icon: <Scale color={COLORS.primary} size={32} />, count: stats.weights.toString(), screen: 'WeightList' },
    { id: '6', title: 'Location', icon: <MapPin color={COLORS.primary} size={32} />, count: stats.locations.toString().padStart(2, '0'), screen: 'LocationList' },
    { id: '4', title: 'Setting', icon: <Settings color={COLORS.primary} size={32} />, count: 'Configure', screen: 'Settings' },
  ];

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const profilePromise = api.get('/users/profile');
      const breedsPromise = api.get('/breeds');
      const animalsPromise = api.get('/animals');
      const employeesPromise = api.get('/users/employees');
      const locationsPromise = api.get('/locations');
      const weightsPromise = api.get('/weights');
      
      const [profileRes, breedsRes, animalsRes, employeesRes, locationsRes, weightsRes] = await Promise.all([
        profilePromise, 
        breedsPromise, 
        animalsPromise, 
        employeesPromise,
        locationsPromise,
        weightsPromise
      ]);
      
      const userData = profileRes.data;
      setUser(userData);

      // Save to cache
      await saveToCache('profile', userData);
      await saveToCache('breeds', breedsRes.data);
      await saveToCache('animals', animalsRes.data);
      await saveToCache('employees', employeesRes.data);
      await saveToCache('locations', locationsRes.data);
      await saveToCache('weights', weightsRes.data);
      
      // Find current farm name
      const currentFarmId = api.defaults.headers.common['X-Farm-ID'];
      const farm = userData.employeeProfile?.farms?.find(f => f.id === currentFarmId);
      if (farm) setFarmName(farm.name);

      setStats({
        breeds: Array.isArray(breedsRes.data) ? breedsRes.data.length : 0,
        employees: Array.isArray(employeesRes.data) ? employeesRes.data.length : 0,
        animals: Array.isArray(animalsRes.data) ? animalsRes.data.length : 0,
        locations: Array.isArray(locationsRes.data) ? locationsRes.data.length : 0,
        weights: Array.isArray(weightsRes.data) ? weightsRes.data.length : 0
      });
      setLoading(false);
    } catch (error) {
      console.warn('Network fetch failed, attempting cache...', error);
      
      // Attempt to load from cache
      const cachedProfile = await getFromCache('profile');
      const cachedBreeds = await getFromCache('breeds');
      const cachedAnimals = await getFromCache('animals');
      const cachedEmployees = await getFromCache('employees');
      const cachedLocations = await getFromCache('locations');
      const cachedWeights = await getFromCache('weights');

      if (cachedProfile) {
        setUser(cachedProfile);
        const currentFarmId = api.defaults.headers.common['X-Farm-ID'];
        const farm = cachedProfile.employeeProfile?.farms?.find(f => f.id === currentFarmId);
        if (farm) setFarmName(farm.name + ' (Offline)');
        
        setStats({
          breeds: Array.isArray(cachedBreeds) ? cachedBreeds.length : 0,
          employees: Array.isArray(cachedEmployees) ? cachedEmployees.length : 0,
          animals: Array.isArray(cachedAnimals) ? cachedAnimals.length : 0,
          locations: Array.isArray(cachedLocations) ? cachedLocations.length : 0,
          weights: Array.isArray(cachedWeights) ? cachedWeights.length : 0
        });
      } else {
        const msg = error.response?.data?.error || error.response?.data?.message || error.message;
        alert('Offline & No Cache: ' + msg);
      }
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await setAuthToken(null);
    await setSelectedFarm(null);
    navigation.replace('Login');
  };

  const renderTile = ({ item }) => (
    <TouchableOpacity 
      style={styles.tile}
      onPress={() => item.screen && navigation.navigate(item.screen)}
    >
      <View style={styles.tileIcon}>
        {item.icon}
      </View>
      <View style={styles.tileInfo}>
        <Text style={styles.tileTitle}>{item.title}</Text>
        <Text style={styles.tileCount}>{item.count}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.welcome}>Active Farm</Text>
          <View style={styles.farmRow}>
            <MapPin size={16} color={COLORS.primary} />
            <Text style={styles.farmName}>{farmName}</Text> 
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Power color={COLORS.error} size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.hiText}>Management Overview</Text>
          <Text style={styles.subHi}>Control your operations from one place</Text>
        </View>

        <FlatList
          data={tiles}
          renderItem={renderTile}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
        />
      </View>
    </SafeAreaView>
  );
};



export default DashboardScreen;
