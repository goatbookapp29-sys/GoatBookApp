import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import GHeader from '../components/GHeader';
import { Ghost, Bug, Edit, ArrowRight, ClipboardList } from 'lucide-react-native';
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
      alert('Failed to load breed record');
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

  const { breed, totalAnimals } = data;

  return (
    <View style={styles.container}>
      <GHeader 
        title="Breed Record" 
        onBack={() => navigation.goBack()}
        rightIcon={<Edit color={COLORS.white} size={22} />}
        onRightPress={() => navigation.navigate('EditBreed', { breed })}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Basic Info */}
        <View style={styles.infoCard}>
          <View style={styles.iconBox}>
            <Ghost size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.breedName}>{breed.name}</Text>
          <Text style={styles.animalType}>{breed.animalType}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.statLine}>
            <Bug size={18} color={COLORS.textLight} />
            <Text style={styles.statValue}>{totalAnimals}</Text>
            <Text style={styles.statLabel}>Animals Registered</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Management Actions</Text>
        
        {/* Navigation Button */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('AnimalList', { breedId: breed.id, initialSearch: breed.name })}
          activeOpacity={0.8}
        >
          <View style={styles.actionIcon}>
            <ClipboardList size={22} color={COLORS.primary} />
          </View>
          <View style={styles.actionTextContent}>
            <Text style={styles.actionTitle}>View Herd List</Text>
            <Text style={styles.actionSubtitle}>See all {breed.name} animals on this farm</Text>
          </View>
          <ArrowRight size={20} color="#D1D5DB" />
        </TouchableOpacity>

        <View style={styles.footerInfo}>
             <Text style={styles.footerText}>Total registered animals updated in real-time.</Text>
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
  scrollContent: {
    padding: SPACING.lg,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    ...SHADOW.sm,
    marginBottom: 32,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FFF1EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  breedName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  animalType: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 4,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#F3F4F6',
    marginVertical: 20,
  },
  statLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 15,
    color: COLORS.textLight,
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
  actionButton: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOW.sm,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF1EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTextContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  actionSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  footerInfo: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
});

export default BreedDetailsScreen;
