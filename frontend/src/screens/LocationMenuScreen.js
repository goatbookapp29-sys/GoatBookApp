import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Dimensions, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import GHeader from '../components/GHeader';
import { Home, Users, Search, LayoutGrid, ArrowRightLeft, PlusCircle } from 'lucide-react-native';
import { SPACING, SHADOW } from '../theme';

const { width } = Dimensions.get('window');

const LocationMenuScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const styles = useMemo(() => getStyles(theme, isDarkMode), [theme, isDarkMode]);

  const menuItems = [
    {
      id: 'create',
      title: 'Create Shed',
      subtitle: 'Add new stable or pen',
      icon: <PlusCircle color={theme.colors.primary} size={32} strokeWidth={1.5} />,
      screen: 'CreateLocation',
    },
    {
      id: 'list',
      title: 'Shed List',
      subtitle: 'View all farm locations',
      icon: <LayoutGrid color={theme.colors.primary} size={32} strokeWidth={1.5} />,
      screen: 'LocationList',
    },
    {
      id: 'single',
      title: 'Single Relocation',
      subtitle: 'Move one animal',
      icon: <Home color={theme.colors.primary} size={32} strokeWidth={1.5} />,
      screen: 'AddLocation',
    },
    {
      id: 'mass',
      title: 'Mass Relocation',
      subtitle: 'Move animals in bulk',
      icon: <ArrowRightLeft color={theme.colors.primary} size={32} strokeWidth={1.5} />,
      screen: 'MassLocation',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GHeader 
        title="Location" 
        onMenu={() => navigation.openDrawer()} 
        leftAlign={true}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '10' }]}>
                {item.icon}
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>{item.title}</Text>
                <Text style={[styles.cardSubtitle, { color: theme.colors.textLight }]}>{item.subtitle}</Text>
              </View>
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  card: {
    width: (width - SPACING.lg * 2 - 16) / 2,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    ...SHADOW.sm,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  textContainer: {
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    opacity: 0.8,
  },
});

export default LocationMenuScreen;
