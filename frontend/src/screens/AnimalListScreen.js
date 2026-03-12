import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import GHeader from '../components/GHeader';
import { Search, Plus, ChevronRight, Bug } from 'lucide-react-native';
import api from '../api';
import { useFocusEffect } from '@react-navigation/native';

const AnimalListScreen = ({ navigation }) => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchAnimals();
    }, [])
  );

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/animals');
      setAnimals(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch animals error:', error);
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.animalItem}
      onPress={() => navigation.navigate('EditAnimal', { animal: item })}
    >
      <View style={styles.iconBox}>
        <Bug size={24} color={COLORS.primary} />
      </View>
      <View style={styles.animalInfo}>
        <Text style={styles.tagNumber}>Tag: {item.tagNumber}</Text>
        <Text style={styles.breedName}>{item.Breed?.name} • {item.gender}</Text>
      </View>
      <ChevronRight size={20} color="#D1D5DB" />
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Bug size={64} color="#E5E7EB" />
      <Text style={styles.noRecords}>No Animals found</Text>
      <Text style={styles.emptyDescription}>
        Start managing your farm by adding your first goat or sheep. Click the button below to register an animal.
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <GHeader 
        title="Animals" 
        onBack={() => navigation.goBack()} 
        rightIcon={<Search color={COLORS.white} size={24} />}
      />
      
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddAnimal')}
        >
          <Plus color={COLORS.white} size={20} style={styles.plusIcon} />
          <Text style={styles.addButtonText}>Add Animal</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={animals}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={EmptyState}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  actionRow: {
    padding: SPACING.lg,
    paddingBottom: SPACING.sm,
    alignItems: 'flex-end',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    ...SHADOW.sm,
  },
  plusIcon: {
    marginRight: 6,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 40,
  },
  animalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFF1EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  animalInfo: {
    flex: 1,
  },
  tagNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  breedName: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: SPACING.xl,
  },
  noRecords: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AnimalListScreen;
