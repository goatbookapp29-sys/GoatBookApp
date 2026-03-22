import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import GHeader from '../components/GHeader';
import { ListPlus, Syringe, Users, ClipboardList } from 'lucide-react-native';

const VaccinesMenuScreen = ({ navigation }) => {
  const options = [
    { 
      id: 'add_vaccine', 
      title: 'Add Vaccine Name', 
      icon: <ListPlus color="#3B82F6" size={40} />, 
      description: 'Define and manage vaccine types for your farm.',
      onPress: () => navigation.navigate('VaccineDefinitions') 
    },
    { 
      id: 'single_vaccination', 
      title: 'Single Vaccination', 
      icon: <Syringe color="#3B82F6" size={40} />, 
      description: 'View and record vaccinations for a specific animal.',
      onPress: () => navigation.navigate('VaccinationList') 
    },
    { 
      id: 'mass_vaccination', 
      title: 'Mass Vaccination', 
      icon: <Users color="#3B82F6" size={40} />, 
      description: 'View and record vaccinations for multiple animals.',
      onPress: () => navigation.navigate('VaccinationList') 
    },
    { 
      id: 'history', 
      title: 'All Records', 
      icon: <ClipboardList color="#10B981" size={40} />, 
      description: 'View all vaccination history for your farm.',
      onPress: () => navigation.navigate('VaccinationList') 
    },
  ];

  return (
    <View style={styles.container}>
      <GHeader title="Vaccines" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {options.map((item) => (
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
    backgroundColor: '#F9FAFB',
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
    width: '48%',
    height: 160,
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
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 50,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});

export default VaccinesMenuScreen;
