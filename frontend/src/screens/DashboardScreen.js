import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../theme/ThemeContext';
import { Power, Dna, User, PawPrint, Settings, MapPin, Scale, Syringe, Heart, ClipboardList, Moon, Sun } from 'lucide-react-native';
import api, { setAuthToken, setSelectedFarm } from '../api';
import styles from './DashboardScreen.styles';
import { useFocusEffect } from '@react-navigation/native';
import GThemeToggle from '../components/GThemeToggle';
import { getFromCache, saveToCache } from '../utils/cache';

const DashboardScreen = ({ navigation }) => {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const [user, setUser] = useState(null);
  const [farmName, setFarmName] = useState('Loading...');
  const [stats, setStats] = useState({ breeds: 0, employees: 0, animals: 0, locations: 0, weights: 0 });
  const [loading, setLoading] = useState(true);

  const tiles = [
    { id: '1', title: 'Breed', icon: <Dna color={theme.colors.primary} size={32} />, count: stats.breeds.toString().padStart(2, '0'), screen: 'BreedList' },
    { id: '2', title: 'Animals', icon: <PawPrint color={theme.colors.primary} size={32} />, count: stats.animals.toString().padStart(2, '0'), screen: 'AnimalList' },
    { id: '3', title: 'Employee', icon: <User color={theme.colors.primary} size={32} />, count: stats.employees.toString().padStart(2, '0'), screen: 'EmployeeList' },
    { id: '4', title: 'Location', icon: <MapPin color={theme.colors.primary} size={32} />, count: stats.locations.toString().padStart(2, '0'), screen: 'LocationList' },
    { id: '5', title: 'Vaccines', icon: <Syringe color={theme.colors.primary} size={32} />, count: 'Records', screen: 'VaccinesMenu' },
    { id: '6', title: 'Weight', icon: <Scale color={theme.colors.primary} size={32} />, count: stats.weights.toString().padStart(2, '0'), screen: 'WeightList' },
    { id: '9', title: 'Report', icon: <ClipboardList color={theme.colors.primary} size={32} />, count: 'Stats', screen: 'ReportsMenu' },
    { id: '11', title: 'Settings', icon: <Settings color={theme.colors.primary} size={32} />, count: 'Configure', screen: 'Settings' },
  ];

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const fetchDashboardData = async () => {
    try {
      // 1. Try Cache First for immediate UI update
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
        if (farm) setFarmName(farm.name);
        
        setStats({
          breeds: Array.isArray(cachedBreeds) ? cachedBreeds.length : 0,
          employees: Array.isArray(cachedEmployees) ? cachedEmployees.length : 0,
          animals: Array.isArray(cachedAnimals) ? cachedAnimals.length : 0,
          locations: Array.isArray(cachedLocations) ? cachedLocations.length : 0,
          weights: Array.isArray(cachedWeights) ? cachedWeights.length : 0
        });
        setLoading(false);
      } else {
        setLoading(true);
      }

      // 2. Fetch fresh profile FIRST (for farm name)
      api.get('/users/profile').then(async (profileRes) => {
        const userData = profileRes.data;
        setUser(userData);
        await saveToCache('profile', userData);
        
        const currentFarmId = api.defaults.headers.common['X-Farm-ID'];
        const farm = userData.employeeProfile?.farms?.find(f => f.id === currentFarmId);
        if (farm) setFarmName(farm.name);
      });

      // 3. Fetch stats in parallel
      const statsPromises = [
        api.get('/breeds'),
        api.get('/animals'),
        api.get('/users/employees'),
        api.get('/locations'),
        api.get('/weights')
      ];

      const [breedsRes, animalsRes, employeesRes, locationsRes, weightsRes] = await Promise.all(statsPromises);
      
      // Update Cache
      await saveToCache('breeds', breedsRes.data);
      await saveToCache('animals', animalsRes.data);
      await saveToCache('employees', employeesRes.data);
      await saveToCache('locations', locationsRes.data);
      await saveToCache('weights', weightsRes.data);

      setStats({
        breeds: Array.isArray(breedsRes.data) ? breedsRes.data.length : 0,
        employees: Array.isArray(employeesRes.data) ? employeesRes.data.length : 0,
        animals: Array.isArray(animalsRes.data) ? animalsRes.data.length : 0,
        locations: Array.isArray(locationsRes.data) ? locationsRes.data.length : 0,
        weights: Array.isArray(weightsRes.data) ? weightsRes.data.length : 0
      });
      
      setLoading(false);
    } catch (error) {
      console.warn('Dashboard fetch error:', error);
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="light" backgroundColor={theme.colors.primary} />
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.userInfo}>
          <Text style={styles.welcome}>Active Farm</Text>
          <View style={styles.farmRow}>
            <MapPin size={16} color="white" />
            <Text style={styles.farmName}>{farmName}</Text> 
          </View>
        </View>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <GThemeToggle />
          <TouchableOpacity 
            onPress={handleLogout} 
            style={[styles.logoutBtn, { marginLeft: 12, backgroundColor: 'rgba(255,255,255,0.2)' }]}
          >
            <Power color="white" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={[styles.hiText, { color: theme.colors.text }]}>Management Overview</Text>
          <Text style={[styles.subHi, { color: theme.colors.textLight }]}>Control your operations from one place</Text>
        </View>

        <FlatList
          data={tiles}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.tile, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => item.screen && navigation.navigate(item.screen)}
            >
              <View style={[styles.tileIcon, { backgroundColor: isDarkMode ? '#1E293B' : '#FFF1EA' }]}>
                {item.icon}
              </View>
              <View style={styles.tileInfo}>
                <Text style={[styles.tileTitle, { color: theme.colors.textMuted }]}>{item.title}</Text>
                <Text style={[styles.tileCount, { color: theme.colors.text }]}>{item.count}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};



export default DashboardScreen;
