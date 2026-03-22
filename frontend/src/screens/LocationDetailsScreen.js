import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, SHADOW, lightTheme } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import GHeader from '../components/GHeader';
import { MapPin, Bug, Edit, ArrowRight, Info, Users } from 'lucide-react-native';
import api from '../api';
import { useFocusEffect } from '@react-navigation/native';

const LocationDetailsScreen = ({ navigation, route }) => {
  const { isDarkMode, theme } = useTheme();
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
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const { location, totalAnimals, distribution } = data;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GHeader 
        title="Location Record" 
        onBack={() => navigation.goBack()}
        rightIcon={<Edit color={theme.colors.white} size={22} />}
        onRightPress={() => navigation.navigate('EditLocation', { location })}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.pathRow}>
             <MapPin size={24} color={theme.colors.primary} />
             <Text style={[styles.locationTitle, { color: theme.colors.text }]}>{location.displayName || location.name}</Text>
          </View>
          <Text style={[styles.locationSubtitle, { color: theme.colors.textLight }]}>{location.code} • {location.type}</Text>
          
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: theme.colors.text }]}>{totalAnimals}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textLight }]}>Animals</Text>
            </View>
            <View style={[styles.verticalDivider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: theme.colors.text }]}>{distribution.length}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textLight }]}>Breeds</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Livestock at this Location</Text>
        
        {distribution.length === 0 ? (
          <View style={[styles.emptyContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Info size={40} color={theme.colors.border} />
            <Text style={[styles.emptyText, { color: theme.colors.textLight }]}>No animals found in this location.</Text>
          </View>
        ) : (
          distribution.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.breedRow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => navigation.navigate('AnimalList', { 
                breedId: item.breedId, 
                locationId: location.id,
                initialSearch: item.breedName 
              })}
              activeOpacity={0.7}
            >
              <View style={[styles.breedIndicator, { backgroundColor: isDarkMode ? '#1E293B' : '#FFF1EA' }]}>
                 <Text style={[styles.indicatorText, { color: theme.colors.primary }]}>{item.breedName[0]}</Text>
              </View>
              <View style={styles.breedInfo}>
                <Text style={[styles.breedName, { color: theme.colors.text }]}>{item.breedName}</Text>
                <Text style={[styles.animalCount, { color: theme.colors.textLight }]}>{item.count} {item.count === 1 ? 'Animal' : 'Animals'}</Text>
              </View>
              <ArrowRight size={18} color={theme.colors.textMuted} />
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
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  infoCard: {
    borderRadius: 32,
    padding: 24,
    ...lightTheme.shadow.md,
    marginBottom: 32,
    borderWidth: 1.5,
  },
  pathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    flex: 1,
  },
  locationSubtitle: {
    fontSize: 15,
    marginTop: 4,
    marginLeft: 36,
    fontWeight: '600',
  },
  divider: {
    height: 1,
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
    fontSize: 26,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verticalDivider: {
    width: 1.5,
    height: 30,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 16,
    marginLeft: 4,
  },
  breedRow: {
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    ...lightTheme.shadow.sm,
    borderWidth: 1.5,
  },
  breedIndicator: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  indicatorText: {
    fontSize: 20,
    fontWeight: '900',
  },
  breedInfo: {
    flex: 1,
  },
  breedName: {
    fontSize: 17,
    fontWeight: '800',
  },
  animalCount: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LocationDetailsScreen;
