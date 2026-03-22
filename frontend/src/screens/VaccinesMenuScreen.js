import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { lightTheme } from '../theme';
import GHeader from '../components/GHeader';
import { ListPlus, Syringe, Users, ClipboardList } from 'lucide-react-native';

const VaccinesMenuScreen = ({ navigation }) => {
  const { isDarkMode, theme } = useTheme();
  const options = [
    { 
      id: 'add_vaccine', 
      title: 'Add Vaccine Name', 
      icon: <ListPlus color={theme.colors.primary} size={32} />, 
      onPress: () => navigation.navigate('VaccineDefinitions') 
    },
    { 
      id: 'single_vaccination', 
      title: 'Single Vaccination', 
      icon: <Syringe color={theme.colors.primary} size={32} />, 
      onPress: () => navigation.navigate('AddVaccination', { mode: 'single' }) 
    },
    { 
      id: 'mass_vaccination', 
      title: 'Mass Vaccination', 
      icon: <Users color={theme.colors.primary} size={32} />, 
      onPress: () => navigation.navigate('AddVaccination', { mode: 'mass' }) 
    },
    { 
      id: 'history', 
      title: 'All Records', 
      icon: <ClipboardList color="#10B981" size={32} />, 
      onPress: () => navigation.navigate('VaccinationList') 
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GHeader title="Vaccines Management" subTitle="Immunization" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {options.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} 
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#1E293B' : '#F3F4F6' }]}>
                {item.icon}
              </View>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{item.title}</Text>
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
  },
  content: {
    padding: 16,
    paddingTop: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    height: 160,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    ...lightTheme.shadow.sm,
  },
  iconContainer: {
    marginBottom: 12,
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    paddingHorizontal: 8,
    letterSpacing: -0.2,
  },
});

export default VaccinesMenuScreen;
