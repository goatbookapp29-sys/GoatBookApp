import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Dimensions, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import GHeader from '../components/GHeader';
import { User, Users, Search } from 'lucide-react-native';
import { SPACING, SHADOW } from '../theme';

const { width } = Dimensions.get('window');

const LocationMenuScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const styles = useMemo(() => getStyles(theme, isDarkMode), [theme, isDarkMode]);

  const menuItems = [
    {
      id: 'single',
      title: 'Single\nLocation/Shed',
      icon: <User color={theme.colors.primary} size={48} strokeWidth={1.5} />,
      screen: 'AddLocation',
    },
    {
      id: 'mass',
      title: 'Mass\nLocation/Shed',
      icon: <Users color={theme.colors.primary} size={48} strokeWidth={1.5} />,
      screen: 'MassLocation',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GHeader 
        title="Location" 
        onBack={() => navigation.goBack()}
        leftAlign={true}
        rightIcon={<Search color="white" size={24} />}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border + '20' }]}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '05' }]}>
                {item.icon}
              </View>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    width: (width - SPACING.lg * 2 - 16) / 2,
    aspectRatio: 0.85,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.small,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LocationMenuScreen;
