import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import GHeader from '../components/GHeader';
import { MapPin, Bug, Edit, ArrowRight, Info, Users } from 'lucide-react-native';
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
      alert('Failed to load location record');
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
        title="Location Record" 
        onBack={() => navigation.goBack()}
        rightIcon={<Edit color={COLORS.white} size={22} />}
        onRightPress={() => navigation.navigate('EditLocation', { location })}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.pathRow}>
             <MapPin size={24} color={COLORS.primary} />
             <Text style={styles.locationTitle}>{location.displayName || location.name}</Text>
          </View>
          <Text style={styles.locationSubtitle}>{location.code} • {location.type}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{totalAnimals}</Text>
              <Text style={styles.statLabel}>Animals</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{distribution.length}</Text>
              <Text style={styles.statLabel}>Breeds</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Livestock at this Location</Text>
        
        {distribution.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Info size={40} color="#D1D5DB" />
            <Text style={styles.emptyText}>No animals found in this location.</Text>
          </View>
        ) : (
          distribution.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.breedRow}
              onPress={() => navigation.navigate('AnimalList', { 
                breedId: item.breedId, 
                locationId: location.id,
                initialSearch: item.breedName 
              })}
              activeOpacity={0.7}
            >
              <View style={styles.breedIndicator}>
                 <Text style={styles.indicatorText}>{item.breedName[0]}</Text>
              </View>
              <View style={styles.breedInfo}>
                <Text style={styles.breedName}>{item.breedName}</Text>
                <Text style={styles.animalCount}>{item.count} {item.count === 1 ? 'Animal' : 'Animals'}</Text>
              </View>
              <ArrowRight size={18} color="#D1D5DB" />
            </TouchableOpacity>
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
    borderRadius: 24,
    padding: 24,
    ...SHADOW.sm,
    marginBottom: 32,
  },
  pathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    flex: 1,
  },
  locationSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
    marginLeft: 36,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 16,
    marginLeft: 4,
  },
  breedRow: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    ...SHADOW.sm,
  },
  breedIndicator: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF1EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  indicatorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  breedInfo: {
    flex: 1,
  },
  breedName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  animalCount: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    ...SHADOW.sm,
  },
  emptyText: {
    color: COLORS.textLight,
    marginTop: 12,
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
});

export default LocationDetailsScreen;
