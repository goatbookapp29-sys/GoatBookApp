import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import GHeader from '../components/GHeader';
import { User, Lock, Home } from 'lucide-react-native';
import api from '../api';

const SettingsScreen = ({ navigation }) => {
  const { isDarkMode, theme } = useTheme();
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
      icon: <User color={theme.colors.primary} size={32} />, 
      onPress: () => navigation.navigate('ProfileSettings'),
      visible: true
    },
    { 
      id: 'farm', 
      title: 'Farm Settings', 
      icon: <Home color={theme.colors.primary} size={32} />, 
      onPress: () => navigation.navigate('FarmSettings'),
      visible: role === 'OWNER'
    },
    { 
      id: 'password', 
      title: 'Change Password', 
      icon: <Lock color={theme.colors.primary} size={32} />, 
      onPress: () => navigation.navigate('ChangePassword'),
      visible: true
    },
  ];

  const visibleOptions = settingsOptions.filter(option => option.visible);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GHeader title="Settings" onMenu={() => navigation.openDrawer()} />
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.grid}>
            {visibleOptions.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} 
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#1E293B' : '#F9FAFB' }]}>
                  {item.icon}
                </View>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{item.title}</Text>
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
    width: '47%',
    height: 150,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1.5,
  },
  iconContainer: {
    marginBottom: SPACING.md,
    padding: 16,
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
});

export default SettingsScreen;
