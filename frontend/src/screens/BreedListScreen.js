import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Animated, Platform, StatusBar } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import GHeader from '../components/GHeader';
import { Search, Plus, ChevronRight, X, Ghost } from 'lucide-react-native';
import api from '../api';
import { useFocusEffect } from '@react-navigation/native';

const BreedListScreen = ({ navigation }) => {
  const [breeds, setBreeds] = useState([]);
  const [filteredBreeds, setFilteredBreeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const searchBarTranslateY = useRef(new Animated.Value(-100)).current;

  useFocusEffect(
    useCallback(() => {
      fetchBreeds();
    }, [])
  );

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBreeds(breeds);
    } else {
      const q = searchQuery.toLowerCase();
      const filtered = breeds.filter(breed => 
        breed.name.toLowerCase().includes(q) ||
        (breed.animalType && breed.animalType.toLowerCase().includes(q))
      );
      setFilteredBreeds(filtered);
    }
  }, [searchQuery, breeds]);

  const fetchBreeds = async () => {
    try {
      setLoading(true);
      const response = await api.get('/breeds');
      setBreeds(response.data);
      setFilteredBreeds(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch breeds error:', error);
      const msg = error.response?.data?.error || error.message;
      alert('Fetch Breeds Error: ' + msg);
      setLoading(false);
    }
  };

  const toggleSearch = () => {
    if (isSearching) {
      setSearchQuery('');
      Animated.timing(searchBarTranslateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsSearching(false));
    } else {
      setIsSearching(true);
      Animated.timing(searchBarTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.breedCard}
      onPress={() => navigation.navigate('BreedDetails', { breedId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.iconBox}>
        <Ghost size={24} color={COLORS.primary} />
      </View>
      <View style={styles.breedInfo}>
        <Text style={styles.breedName}>{item.name}</Text>
        <Text style={styles.animalType}>{item.animalType}</Text>
      </View>
      <ChevronRight size={20} color="#D1D5DB" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <GHeader 
        title="Breeds" 
        onBack={() => navigation.goBack()} 
        rightIcon={isSearching ? <X color={COLORS.white} size={24} /> : <Search color={COLORS.white} size={24} />}
        onRightPress={toggleSearch}
      />
      
      {isSearching && (
        <Animated.View style={[styles.searchBarContainer, { transform: [{ translateY: searchBarTranslateY }] }]}>
          <View style={styles.searchInner}>
            <Search size={20} color={COLORS.textLight} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search breed name or type..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color={COLORS.textLight} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      )}

      {!isSearching && (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddBreed')}
          >
            <Plus color={COLORS.white} size={20} style={styles.plusIcon} />
            <Text style={styles.addButtonText}>Add New Breed</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredBreeds}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Ghost size={64} color="#E5E7EB" />
                <Text style={styles.noRecords}>No Breeds Found</Text>
                <Text style={styles.emptyDesc}>Register different breeds to categorize your livestock.</Text>
            </View>
          }
          contentContainerStyle={[styles.listContent, isSearching && { paddingTop: 20 }]}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchBarContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    ...SHADOW.sm,
    zIndex: 5,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 8,
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
  breedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...SHADOW.sm,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFF1EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  breedInfo: {
    flex: 1,
  },
  breedName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  animalType: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 40,
  },
  noRecords: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginTop: 16,
  },
  emptyDesc: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BreedListScreen;
