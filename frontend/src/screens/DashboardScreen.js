import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import { Power, Ghost, Users, Bug, Settings, MapPin } from 'lucide-react-native';
import api, { setAuthToken, setSelectedFarm } from '../api';
import { useFocusEffect } from '@react-navigation/native';

const DashboardScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [farmName, setFarmName] = useState('Loading...');
  const [stats, setStats] = useState({ breeds: 0, employees: 0, animals: 0 });
  const [loading, setLoading] = useState(true);

  const tiles = [
    { id: '1', title: 'Breed', icon: <Ghost color={COLORS.primary} size={32} />, count: stats.breeds.toString().padStart(2, '0'), screen: 'BreedList' },
    { id: '2', title: 'Employee', icon: <Users color={COLORS.primary} size={32} />, count: stats.employees.toString().padStart(2, '0'), screen: 'EmployeeList' },
    { id: '3', title: 'Animal', icon: <Bug color={COLORS.primary} size={32} />, count: stats.animals.toString(), screen: 'AnimalList' },
    { id: '4', title: 'Setting', icon: <Settings color={COLORS.primary} size={32} />, count: 'Configure', screen: 'Settings' },
  ];

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const fetchDashboardData = async () => {
    try {
      const profilePromise = api.get('/users/profile');
      const breedsPromise = api.get('/breeds');
      const animalsPromise = api.get('/animals');
      const employeesPromise = api.get('/users/employees');
      
      const [profileRes, breedsRes, animalsRes, employeesRes] = await Promise.all([
        profilePromise, 
        breedsPromise, 
        animalsPromise, 
        employeesPromise
      ]);
      
      const userData = profileRes.data;
      setUser(userData);

      // Find the name of the farm we are currently looking at
      const currentFarmId = api.defaults.headers.common['X-Farm-ID'];
      const farm = userData.employeeProfile?.farms?.find(f => f.id === currentFarmId);
      if (farm) {
        setFarmName(farm.name);
      } else {
        setFarmName('My Farm');
      }

      setStats({
        breeds: breedsRes.data.length,
        employees: employeesRes.data.length,
        animals: animalsRes.data.length
      });
      setLoading(false);
    } catch (error) {
      console.error('Fetch dashboard error:', error);
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    ...SHADOW.sm,
  },
  userInfo: {
    flex: 1,
  },
  welcome: {
    fontSize: 12,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  farmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  farmName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 6,
  },
  logoutBtn: {
    padding: SPACING.sm,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },
  content: {
    padding: SPACING.lg,
    flex: 1,
  },
  welcomeSection: {
    marginBottom: SPACING.xl,
  },
  hiText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subHi: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  row: {
    justifyContent: 'space-between',
  },
  list: {
    paddingBottom: SPACING.xl,
  },
  tile: {
    backgroundColor: COLORS.white,
    width: '48%',
    borderRadius: 20,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOW.md,
  },
  tileIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFF1EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tileTitle: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  tileCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 2,
  },
});

export default DashboardScreen;
