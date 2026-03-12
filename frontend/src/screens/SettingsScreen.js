import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import GHeader from '../components/GHeader';
import { User, Lock } from 'lucide-react-native';

const SettingsScreen = ({ navigation }) => {
  const settingsOptions = [
    { 
      id: 'profile', 
      title: 'Profile Settings', 
      icon: <User color={COLORS.primary} size={40} />, 
      onPress: () => navigation.navigate('ProfileSettings') 
    },
    { 
      id: 'password', 
      title: 'Change Password', 
      icon: <Lock color={COLORS.primary} size={40} />, 
      onPress: () => navigation.navigate('ChangePassword') 
    },
  ];

  return (
    <View style={styles.container}>
      <GHeader title="Settings" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.row}>
          {settingsOptions.map((item) => (
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: SPACING.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: COLORS.white,
    width: '48%',
    height: 160,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6', // Very light gray border
    ...SHADOW.sm,
  },
  iconContainer: {
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
});

export default SettingsScreen;
