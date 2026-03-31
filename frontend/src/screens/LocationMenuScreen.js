import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import GHeader from '../components/GHeader';
import { Home, Users, Search } from 'lucide-react-native';
import { SPACING } from '../theme';

const { width } = Dimensions.get('window');

const LocationMenuScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const styles = useMemo(() => getStyles(theme, isDarkMode), [theme, isDarkMode]);

  const menuItems = [
    {
      id: 'create',
      title: 'Create Location/Shed',
      icon: <Home color={theme.colors.primary} size={32} strokeWidth={2} />,
      screen: 'CreateLocation',
    },
    {
      id: 'single',
      title: 'Assign Single Animal',
      icon: <Users color={theme.colors.primary} size={32} strokeWidth={2} />,
      screen: 'AddLocation',
    },
    {
      id: 'mass',
      title: 'Assign Mass Animals',
      icon: <Users color={theme.colors.primary} size={32} strokeWidth={2} />,
      screen: 'MassLocation',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GHeader 
        title="Location" 
        onBack={() => navigation.goBack()} 
        rightIcon={<Search color="#FFF" size={24} />}
        onRightPress={() => navigation.navigate('LocationList')}
      />
      
      <View style={styles.content}>
        <View style={styles.grid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                {item.icon}
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
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
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  iconContainer: {
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    color: theme.colors.text,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
});

export default LocationMenuScreen;
