import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import GHeader from '../components/GHeader';
import { MapPin, ChevronRight, Bug, Edit, Info, Users, Clock } from 'lucide-react-native';
import api from '../api';
import { useFocusEffect } from '@react-navigation/native';

const LocationDetailsScreen = ({ navigation, route }) => {
  const { locationId } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchDetails();
    }, [locationId])
  );

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/locations/${locationId}/stats`);
      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch location details error:', error);
      alert('Failed to load location details');
      navigation.goBack();
    }
  };

  if (loading || !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const { location, totalAnimals, distribution } = data;

  return (
    <View style={styles.container}>
      <GHeader 
        title="Location Details" 
        onBack={() => navigation.goBack()}
        rightIcon={<Edit color={COLORS.white} size={22} />}
        onRightPress={() => navigation.navigate('EditLocation', { location })}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Location Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.pathHeader}>
            <MapPin size={20} color={COLORS.primary} style={styles.pinIcon} />
            <Text style={styles.pathText}>{location.displayName || location.name}</Text>
          </View>
          
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Short Code</Text>
              <Text style={styles.metaValue}>{location.code}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Type</Text>
              <Text style={styles.metaValue}>{location.type}</Text>
            </View>
          </View>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsSummary}>
          <View style={[styles.statBox, { backgroundColor: '#E0F2FE' }]}>
            <Bug size={24} color="#0284C7" />
            <Text style={styles.statCount}>{totalAnimals}</Text>
            <Text style={styles.statLabel}>Total Animals</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#F0FDF4' }]}>
            <Users size={24} color="#16A34A" />
            <Text style={styles.statCount}>{distribution.length}</Text>
            <Text style={styles.statLabel}>Breeds Present</Text>
          </View>
        </View>

        {/* Animals Grouped by Breed */}
        <Text style={styles.sectionTitle}>Livestock by Breed</Text>
        
        {distribution.length === 0 ? (
          <View style={styles.emptyState}>
            <Info size={40} color="#D1D5DB" />
            <Text style={styles.emptyText}>No animals currently assigned to this location.</Text>
          </View>
        ) : (
          distribution.map((item, index) => (
            <View key={index} style={styles.breedGroup}>
              <View style={styles.breedHeader}>
                <View>
                  <Text style={styles.groupBreedName}>{item.breedName}</Text>
                  <Text style={styles.animalCountText}>{item.count} {item.count === 1 ? 'Animal' : 'Animals'}</Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{item.count}</Text>
                </View>
              </View>

              <View style={styles.animalGrid}>
                {item.animals.map((animal) => (
                  <TouchableOpacity 
                    key={animal.id} 
                    style={styles.animalTag}
                    onPress={() => navigation.navigate('EditAnimal', { animal })}
                  >
                    <Text style={styles.tagNumber}>{animal.tagNumber}</Text>
                    <Text style={styles.genderText}>{animal.gender.toLowerCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    ...SHADOW.sm,
    marginBottom: 20,
  },
  pathHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pinIcon: {
    marginRight: 10,
  },
  pathText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  statsSummary: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...SHADOW.sm,
  },
  statCount: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    marginLeft: 4,
  },
  breedGroup: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...SHADOW.sm,
  },
  breedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  groupBreedName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  animalCountText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  countBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countBadgeText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  animalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  animalTag: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 10,
    width: '31%',
    alignItems: 'center',
  },
  tagNumber: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  genderText: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2,
  },
  emptyState: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  emptyText: {
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
});

export default LocationDetailsScreen;
