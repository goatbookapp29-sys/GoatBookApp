import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import GHeader from '../components/GHeader';
import { Ghost, ChevronRight, Bug, Edit, Info, MapPin } from 'lucide-react-native';
import api from '../api';
import { useFocusEffect } from '@react-navigation/native';

const BreedDetailsScreen = ({ navigation, route }) => {
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
      alert('Failed to load breed details');
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

  const { breed, totalAnimals, distribution } = data;

  return (
    <View style={styles.container}>
      <GHeader 
        title="Breed Details" 
        onBack={() => navigation.goBack()}
        rightIcon={<Edit color={COLORS.white} size={22} />}
        onRightPress={() => navigation.navigate('EditBreed', { breed })}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Breed Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.titleRow}>
            <Ghost size={24} color={COLORS.primary} style={styles.icon} />
            <Text style={styles.breedName}>{breed.name}</Text>
          </View>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Animal Type</Text>
              <Text style={styles.metaValue}>{breed.animalType}</Text>
            </View>
          </View>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsSummary}>
          <View style={[styles.statBox, { backgroundColor: '#FFF7ED' }]}>
            <Bug size={24} color="#C2410C" />
            <Text style={styles.statCount}>{totalAnimals}</Text>
            <Text style={styles.statLabel}>Total {breed.name}s</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#F0F9FF' }]}>
            <MapPin size={24} color="#0369A1" />
            <Text style={styles.statCount}>{distribution.length}</Text>
            <Text style={styles.statLabel}>Locations Used</Text>
          </View>
        </View>

        {/* Animals Grouped by Location */}
        <Text style={styles.sectionTitle}>Distribution across Farm</Text>
        
        {distribution.length === 0 ? (
          <View style={styles.emptyState}>
            <Info size={40} color="#D1D5DB" />
            <Text style={styles.emptyText}>No animals of this breed found in farm records.</Text>
          </View>
        ) : (
          distribution.map((item, index) => (
            <View key={index} style={styles.locationGroup}>
              <TouchableOpacity 
                style={styles.groupHeader}
                onPress={() => navigation.navigate('AnimalList', { initialSearch: item.locationName })}
              >
                <View>
                  <Text style={styles.groupTitle}>{item.locationName}</Text>
                  <Text style={styles.subText}>{item.count} Animals</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.count}</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.animalGrid}>
                {item.animals.map((animal) => (
                  <TouchableOpacity 
                    key={animal.id} 
                    style={styles.animalTag}
                    onPress={() => navigation.navigate('EditAnimal', { animal })}
                  >
                    <Text style={styles.tagNum}>{animal.tagNumber}</Text>
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
    backgroundColor: '#F9FAFB',
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  icon: {
    marginRight: 12,
  },
  breedName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  metaRow: {
    flexDirection: 'row',
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textTransform: 'uppercase',
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
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    marginLeft: 4,
  },
  locationGroup: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...SHADOW.sm,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  subText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
  animalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  animalTag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 10,
    width: '31%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tagNum: {
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
    ...SHADOW.sm,
  },
  emptyText: {
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
});

export default BreedDetailsScreen;
