import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import GHeader from '../components/GHeader';
import { User, Lock, Home } from 'lucide-react-native';
import api from '../api';

const SettingsScreen = ({ navigation }) => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setRole(response.data?.employeeProfile?.employeeType);
    } catch (error) {
      console.error('Error fetching profile in settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const settingsOptions = [
    { 
      id: 'profile', 
      title: 'Profile Settings', 
      icon: <User color={COLORS.primary} size={40} />, 
      onPress: () => navigation.navigate('ProfileSettings'),
      visible: true
    },
    { 
      id: 'farm', 
      title: 'Farm Settings', 
      icon: <Home color={COLORS.primary} size={40} />, 
      onPress: () => navigation.navigate('FarmSettings'),
      visible: role === 'OWNER'
    },
    { 
      id: 'password', 
      title: 'Change Password', 
      icon: <Lock color={COLORS.primary} size={40} />, 
      onPress: () => navigation.navigate('ChangePassword'),
      visible: true
    },
  ];

  const visibleOptions = settingsOptions.filter(option => option.visible);

  return (
    <View style={styles.container}>
      <GHeader title="Settings" onBack={() => navigation.goBack()} />
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.grid}>
            {visibleOptions.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.card} 
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>
                  {item.icon}
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Light gray background for better card contrast
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: COLORS.white,
    width: '47%', // Slightly less than 50% to allow for spacing
    height: 140,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...SHADOW.sm,
  },
  iconContainer: {
    marginBottom: SPACING.sm,
    backgroundColor: '#F3F4F6', // Subtle background for icon
    padding: 12,
    borderRadius: 50,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
});

export default SettingsScreen;
