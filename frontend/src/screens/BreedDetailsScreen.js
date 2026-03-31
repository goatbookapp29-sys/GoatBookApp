import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { COLORS, SPACING, SHADOW, lightTheme } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import GHeader from '../components/GHeader';
import { Ghost, Bug, Edit, ArrowRight, ClipboardList, MapPin, ChevronRight, SearchX, Plus } from 'lucide-react-native';
import api from '../api';
import { useFocusEffect } from '@react-navigation/native';

const BreedDetailsScreen = ({ navigation, route }) => {
  const { isDarkMode, theme } = useTheme();
  const styles = useMemo(() => getStyles(theme, isDarkMode), [theme, isDarkMode]);
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
        rightIcon={!breed.isDefault && <Edit color={theme.colors.white} size={22} />}
        onRightPress={() => !breed.isDefault && navigation.navigate('EditBreed', { breed })}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Basic Info */}
        <View style={styles.infoCard}>
          <Text style={[styles.breedName, { color: theme.colors.text }]}>{breed.name}</Text>
          <Text style={[styles.animalType, { color: theme.colors.textLight }]}>{breed.animalType}</Text>
          
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          
          <View style={styles.statLine}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{totalAnimals}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.textLight }]}>Animals Registered</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>HERD LIST</Text>
        
        {data.distribution && data.distribution.length > 0 ? (
          data.distribution.map((loc, idx) => (
            <View key={loc.locationName + idx} style={styles.locationSection}>
              {loc.animals.map((animal) => (
                <TouchableOpacity 
                   key={animal.id} 
                   style={[styles.animalCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                   onPress={() => navigation.navigate('EditAnimal', { animal })}
                   activeOpacity={0.7}
                >
                  {/* Thumbnail */}
                  {animal.imageUrl ? (
                    <Image source={{ uri: animal.imageUrl }} style={styles.animalThumbnail} />
                  ) : (
                    <View style={[styles.animalThumbnail, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9', justifyContent: 'center', alignItems: 'center' }]}>
                      <Text style={{ fontSize: 10, color: theme.colors.textMuted, textAlign: 'center' }}>No Image</Text>
                    </View>
                  )}

                  {/* Main Info */}
                  <View style={styles.animalInfo}>
                    <Text style={[styles.tagNumber, { color: theme.colors.text }]}>Tag: {animal.tagNumber}</Text>
                    <Text style={[styles.breedGenderText, { color: theme.colors.textLight }]}>
                      {breed.name} • {animal.gender ? animal.gender.charAt(0).toUpperCase() + animal.gender.slice(1).toLowerCase() : ''}
                    </Text>
                    
                    <View style={styles.locationBadgeInside}>
                      <MapPin size={12} color={theme.colors.textLight} />
                      <Text style={[styles.locationTextInside, { color: theme.colors.textLight }]}>{loc.locationName}</Text>
                    </View>
                  </View>
                  
                  {/* Status and Action */}
                  <View style={styles.statusActionRow}>
                    <View style={[styles.statusBadge, styles[`status${animal.status}`]]}>
                      <Text style={styles.statusText}>
                        {animal.status ? animal.status.charAt(0).toUpperCase() + animal.status.slice(1).toLowerCase() : 'Live'}
                      </Text>
                    </View>
                    <ChevronRight size={18} color={theme.colors.textMuted} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <SearchX size={48} color={theme.colors.border} />
            <Text style={[styles.emptyText, { color: theme.colors.textLight }]}>No animals registered for this breed.</Text>
            <TouchableOpacity 
              style={[styles.quickAddButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigation.navigate('AddAnimal', { breedId: breed.id })}
            >
              <Plus size={18} color="white" strokeWidth={3} />
              <Text style={styles.quickAddText}>Add First Animal</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.footerInfo}>
             <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>Total registered animals updated in real-time.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    maxWidth: 768,
    width: '100%',
    alignSelf: 'center',
  },
  infoCard: {
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  breedName: {
    fontSize: 22,
    fontFamily: 'Montserrat_600SemiBold',
  },
  animalType: {
    fontSize: 15,
    fontFamily: 'Montserrat_500Medium',
    marginTop: 4,
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
    fontSize: 22,
    fontFamily: 'Montserrat_600SemiBold',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  locationSection: {
    marginBottom: 8,
  },
  animalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    backgroundColor: theme.colors.surface,
  },
  animalThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 14,
  },
  animalInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  tagNumber: {
    fontSize: 16,
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 2,
  },
  breedGenderText: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    marginBottom: 6,
  },
  locationBadgeInside: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
    alignSelf: 'flex-start',
  },
  locationTextInside: {
    fontSize: 11,
    fontFamily: 'Montserrat_600SemiBold',
    textTransform: 'uppercase',
  },
  statusActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Montserrat_600SemiBold',
    color: 'white',
  },
  statusLIVE: { backgroundColor: '#10B981' },
  statusSOLD: { backgroundColor: '#3B82F6' },
  statusDEAD: { backgroundColor: '#EF4444' },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 20,
    fontFamily: 'Montserrat_500Medium',
  },
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  quickAddText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BreedDetailsScreen;
