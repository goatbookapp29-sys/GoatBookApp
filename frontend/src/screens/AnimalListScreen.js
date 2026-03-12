import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Animated, Platform } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import GHeader from '../components/GHeader';
import { Search, Plus, ChevronRight, Bug, X, MapPin } from 'lucide-react-native';
import api from '../api';
import { useFocusEffect } from '@react-navigation/native';

const AnimalListScreen = ({ navigation, route }) => {
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchBarTranslateY = useRef(new Animated.Value(-100)).current;

  useFocusEffect(
    useCallback(() => {
      fetchAnimals();
      if (route.params?.initialSearch) {
        setSearchQuery(route.params.initialSearch);
        setIsSearching(true);
      }
    }, [route.params])
  );

  useEffect(() => {
    let result = animals;
    
    // Strict filters from navigation
    if (route.params?.breedId) {
      result = result.filter(a => a.breedId === route.params.breedId);
    }
    if (route.params?.locationId) {
      result = result.filter(a => a.locationId === route.params.locationId);
    }

    // Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(animal => 
        animal.tagNumber.toLowerCase().includes(q) ||
        (animal.Breed?.name && animal.Breed.name.toLowerCase().includes(q)) ||
        (animal.Location?.name && animal.Location.name.toLowerCase().includes(q))
      );
    }
    
    setFilteredAnimals(result);
  }, [searchQuery, animals, route.params]);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/animals');
      setAnimals(response.data);
      setFilteredAnimals(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch animals error:', error);
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
      style={styles.animalItem}
      onPress={() => navigation.navigate('EditAnimal', { animal: item })}
    >
      <View style={styles.iconBox}>
        <Bug size={24} color={COLORS.primary} />
      </View>
      <View style={styles.animalInfo}>
        <Text style={styles.tagNumber}>Tag: {item.tagNumber}</Text>
        <Text style={styles.breedName}>{item.Breed?.name} • {item.gender}</Text>
        {item.Location && (
          <View style={styles.locationTag}>
            <MapPin size={12} color={COLORS.textLight} style={styles.locIcon} />
            <Text style={styles.locationName}>{item.Location.name}</Text>
          </View>
        )}
      </View>
      <ChevronRight size={20} color="#D1D5DB" />
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Bug size={64} color="#E5E7EB" />
      <Text style={styles.noRecords}>
        {searchQuery ? "No matching animals found" : "No Animals found"}
      </Text>
      {!searchQuery && (
        <Text style={styles.emptyDescription}>
          Start managing your farm by adding your first goat or sheep. Click the button below to register an animal.
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <GHeader 
        title="Animals" 
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
              placeholder="Search tag, breed or location..."
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
            onPress={() => navigation.navigate('AddAnimal')}
          >
            <Plus color={COLORS.white} size={20} style={styles.plusIcon} />
            <Text style={styles.addButtonText}>Add Animal</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredAnimals}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={EmptyState}
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
    backgroundColor: '#FFFFFF',
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
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locIcon: {
    marginRight: 4,
  },
  locationName: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
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
