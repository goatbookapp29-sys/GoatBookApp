import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import GHeader from '../components/GHeader';
import { ClipboardList, Heart, Calculator, Printer } from 'lucide-react-native';

const ReportsMenuScreen = ({ navigation }) => {
  const options = [
    { 
      id: 'overall', 
      title: 'Animal Overall Report', 
      icon: <ClipboardList color="#1E40AF" size={40} />, 
      onPress: () => navigation.navigate('OverallReport') 
    },
    { 
      id: 'condition', 
      title: 'Female Condition Report', 
      icon: <Heart color="#1E40AF" size={40} />, 
      onPress: null // Not in work yet
    },
    { 
      id: 'vaccination', 
      title: 'Vaccination Report', 
      icon: <Calculator color="#1E40AF" size={40} />, 
      onPress: null // Not in work yet
    },
    { 
      id: 'sales', 
      title: 'Generate Sales Report', 
      icon: <Printer color="#1E40AF" size={40} />, 
      onPress: null // Not in work yet
    },
  ];

  return (
    <View style={styles.container}>
      <GHeader title="Reports" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          {options.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.card, !item.onPress && styles.disabledCard]} 
              onPress={item.onPress || (() => {})}
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
  disabledCard: {
    opacity: 0.5,
    backgroundColor: '#F3F4F6',
  },
  iconContainer: {
    marginBottom: SPACING.sm,
    padding: 16,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});

export default ReportsMenuScreen;
