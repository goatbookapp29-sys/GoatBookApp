import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, SHADOW, lightTheme } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import GHeader from '../components/GHeader';
import { Ghost, Bug, Edit, ArrowRight, ClipboardList } from 'lucide-react-native';
import api from '../api';
import { useFocusEffect } from '@react-navigation/native';

const BreedDetailsScreen = ({ navigation, route }) => {
  const { isDarkMode, theme } = useTheme();
  const { breedId } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchDetails();
    }, [breedId])
  );

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/breeds/${breedId}/stats`);
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch breed details error:', error);
      alert('Failed to load breed record');
      navigation.goBack();
    }
  };

  if (loading || !data) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const { breed, totalAnimals } = data;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GHeader 
        title="Breed Record" 
        onBack={() => navigation.goBack()}
        rightIcon={<Edit color={theme.colors.white} size={22} />}
        onRightPress={() => navigation.navigate('EditBreed', { breed })}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Basic Info */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#1E293B' : '#FFF1EA' }]}>
            <Ghost size={32} color={theme.colors.primary} />
          </View>
          <Text style={[styles.breedName, { color: theme.colors.text }]}>{breed.name}</Text>
          <Text style={[styles.animalType, { color: theme.colors.textLight }]}>{breed.animalType}</Text>
          
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          
          <View style={styles.statLine}>
            <Bug size={18} color={theme.colors.primary} />
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{totalAnimals}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textLight }]}>Animals Registered</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Management Actions</Text>
        
        {/* Navigation Button */}
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={() => navigation.navigate('AnimalList', { breedId: breed.id, initialSearch: breed.name })}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIcon, { backgroundColor: isDarkMode ? '#1E293B' : '#EEF2FF' }]}>
            <ClipboardList size={22} color={theme.colors.primary} />
          </View>
          <View style={styles.actionTextContent}>
            <Text style={[styles.actionTitle, { color: theme.colors.text }]}>View Herd List</Text>
            <Text style={[styles.actionSubtitle, { color: theme.colors.textLight }]}>See all {breed.name} animals on this farm</Text>
          </View>
          <ArrowRight size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.footerInfo}>
             <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>Total registered animals updated in real-time.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  infoCard: {
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    ...lightTheme.shadow.md,
    marginBottom: 32,
    borderWidth: 1.5,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  breedName: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  animalType: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 20,
  },
  statLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 16,
    marginLeft: 4,
  },
  actionButton: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...lightTheme.shadow.sm,
    borderWidth: 1.5,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTextContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  actionSubtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  footerInfo: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BreedDetailsScreen;
