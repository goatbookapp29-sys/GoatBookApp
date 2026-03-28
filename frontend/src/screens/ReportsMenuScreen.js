import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { lightTheme } from '../theme';
import GHeader from '../components/GHeader';
import { ClipboardList, Heart, Calculator, Printer } from 'lucide-react-native';

const ReportsMenuScreen = ({ navigation }) => {
  const { isDarkMode, theme } = useTheme();
  const options = [
    { 
      id: 'overall', 
      title: 'Animal Overall Report', 
      icon: <ClipboardList color={theme.colors.primary} size={32} />, 
      onPress: () => navigation.navigate('OverallReport') 
    },
    { 
      id: 'condition', 
      title: 'Female Condition Report', 
      icon: <Heart color={theme.colors.primary} size={32} />, 
      onPress: null 
    },
    { 
      id: 'vaccination', 
      title: 'Vaccination Report', 
      icon: <Calculator color={theme.colors.primary} size={32} />, 
      onPress: null 
    },
    { 
      id: 'sales', 
      title: 'Generate Sales Report', 
      icon: <Printer color={theme.colors.primary} size={32} />, 
      onPress: null 
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GHeader title="Reports Center" subTitle="Analysis" onMenu={() => navigation.openDrawer()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {options.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, !item.onPress && styles.disabledCard]} 
              onPress={item.onPress || (() => {})}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF' }]}>
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
    backgroundColor: '#FFFFFF',
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
    borderRadius: 8,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  disabledCard: {
    opacity: 0.5,
  },
  iconContainer: {
    marginBottom: 12,
    width: 64,
    height: 64,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    textAlign: 'center',
    paddingHorizontal: 8,
    letterSpacing: -0.2,
  },
});

export default ReportsMenuScreen;
