import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import { Power, Ghost, Users, Bug, Settings } from 'lucide-react-native';
import api, { setAuthToken } from '../api';
import { useFocusEffect } from '@react-navigation/native';

const DashboardScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ breeds: 0, employees: 8, animals: 145 });
  const [loading, setLoading] = useState(true);

  const tiles = [
    { id: '1', title: 'Breed', icon: <Ghost color={COLORS.primary} size={32} />, count: stats.breeds.toString().padStart(2, '0'), screen: 'BreedList' },
    { id: '2', title: 'Employee', icon: <Users color={COLORS.primary} size={32} />, count: stats.employees.toString().padStart(2, '0') },
    { id: '3', title: 'Animal', icon: <Bug color={COLORS.primary} size={32} />, count: stats.animals.toString() },
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
      
      const [profileRes, breedsRes] = await Promise.all([profilePromise, breedsPromise]);
      
      setUser(profileRes.data);
      setStats(prev => ({ ...prev, breeds: breedsRes.data.length }));
      setLoading(false);
    } catch (error) {
      console.error('Fetch dashboard error:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await setAuthToken(null);
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
        <View>
          <Text style={styles.welcome}>Welcome back,</Text>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={styles.userName}>
              {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Power color={COLORS.error} size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Overview</Text>
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
  welcome: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
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
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOW.md,
  },
  tileIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
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
