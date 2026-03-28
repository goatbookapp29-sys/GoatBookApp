import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../theme/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { 
  Menu, GitBranch, PawPrint, User, Home, Syringe, Scale, 
  Heart, Activity, ClipboardList, Globe, Settings, Briefcase
} from 'lucide-react-native';
import api, { setAuthToken, setSelectedFarm } from '../api';
import styles from './DashboardScreen.styles';

const DashboardScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [farmName, setFarmName] = useState('Goatwala Farm');

  useFocusEffect(
    useCallback(() => {
      // Fetch profile to get real farm name
      api.get('/users/profile').then(res => {
         const currentFarmId = api.defaults.headers.common['X-Farm-ID'];
         const farm = res.data.employeeProfile?.farms?.find(f => f.id === currentFarmId);
         if (farm) setFarmName(farm.name);
      }).catch(err => console.warn('Silently failed to fetch profile in dashboard:', err));
    }, [])
  );

  const tiles = [
    { id: '1', title: 'Breed', icon: <GitBranch color={theme.colors.primary} size={34} strokeWidth={1.8} />, screen: 'BreedList' },
    { id: '2', title: 'Animals', icon: <PawPrint color={theme.colors.primary} size={36} strokeWidth={1.5} />, screen: 'AnimalList' },
    { id: '3', title: 'Employee', icon: <User color={theme.colors.primary} size={36} strokeWidth={1.5} />, screen: 'EmployeeList' },
    { id: '4', title: 'Location', icon: <Home color={theme.colors.primary} size={36} strokeWidth={1.5} />, screen: 'LocationList' },
    { id: '5', title: 'Vaccines', icon: <Syringe color={theme.colors.primary} size={36} strokeWidth={1.5} />, screen: 'VaccinesMenu' },
    { id: '6', title: 'Weight', icon: <Scale color={theme.colors.primary} size={36} strokeWidth={1.5} />, screen: 'WeightList' },
    { id: '7', title: 'Mating', icon: <Heart color={theme.colors.primary} size={36} strokeWidth={1.5} />, screen: null },
    { id: '8', title: 'Breeding', icon: <Activity color={theme.colors.primary} size={36} strokeWidth={1.5} />, screen: null },
    { id: '9', title: 'Report', icon: <ClipboardList color={theme.colors.primary} size={36} strokeWidth={1.5} />, screen: 'ReportsMenu' },
    { id: '10', title: 'Language', icon: <Globe color={theme.colors.primary} size={36} strokeWidth={1.5} />, screen: null },
    { id: '11', title: 'Settings', icon: <Settings color={theme.colors.primary} size={36} strokeWidth={1.5} />, screen: 'Settings' },
    { id: '12', title: 'Financials', icon: <Briefcase color={theme.colors.primary} size={36} strokeWidth={1.5} />, screen: null },
  ];

  const renderTile = ({ item }) => (
    <TouchableOpacity 
      style={styles.tile}
      onPress={() => item.screen && navigation.navigate(item.screen)}
      activeOpacity={0.7}
    >
      <View style={styles.tileIcon}>
        {item.icon}
      </View>
      <Text style={styles.tileTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  const handleLogout = async () => {
    await setAuthToken(null);
    await setSelectedFarm(null);
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor={theme.colors.primary} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity style={styles.menuButton}>
            <Menu color="#FFF" size={28} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{farmName}</Text>
        </View>
      </View>

      {/* Grid */}
      <View style={styles.content}>
        <FlatList
          data={tiles}
          renderItem={renderTile}
          keyExtractor={item => item.id}
          numColumns={3}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          bounces={false}
        />
      </View>
    </SafeAreaView>
  );
};

export default DashboardScreen;
