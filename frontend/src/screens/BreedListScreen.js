import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Animated, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { lightTheme } from '../theme';
import GHeader from '../components/GHeader';
import { Search, Plus, ChevronRight, X, SearchX } from 'lucide-react-native';
import api from '../api';
import { useFocusEffect } from '@react-navigation/native';
import { getFromCache, saveToCache } from '../utils/cache';

const BreedListScreen = ({ navigation }) => {
  const { isDarkMode, theme } = useTheme();
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
      
      // Cache data
      await saveToCache('breeds', response.data);
      
      setBreeds(response.data);
      setFilteredBreeds(response.data);
      setLoading(false);
    } catch (error) {
      console.warn('Fetch breeds failed, looking for cache...', error);
      
      const cachedData = await getFromCache('breeds');
      if (cachedData) {
        setBreeds(cachedData);
        setFilteredBreeds(cachedData);
      } else {
        const msg = error.response?.data?.error || error.message;
        alert('Offline & No Cache: ' + msg);
      }
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
      style={[styles.breedCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={() => navigation.navigate('BreedDetails', { breedId: item.id })}
      activeOpacity={0.7}
    >

      <View style={styles.breedInfo}>
        <Text style={[styles.breedName, { color: theme.colors.text }]}>{item.name}</Text>
        <Text style={[styles.animalType, { color: theme.colors.textLight }]}>{item.animalType}</Text>
      </View>
      <ChevronRight size={20} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GHeader 
        title="Breeds List" 
        onBack={() => navigation.goBack()} 
        rightIcon={isSearching ? <X color={theme.colors.white} size={24} /> : <Search color={theme.colors.white} size={24} />}
        onRightPress={toggleSearch}
      />
      
      {isSearching && (
        <Animated.View style={[styles.searchBarContainer, { backgroundColor: theme.colors.surface, transform: [{ translateY: searchBarTranslateY }] }]}>
          <View style={[styles.searchInner, { backgroundColor: theme.colors.background }]}>
            <Search size={20} color={theme.colors.textLight} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search breed name or type..."
              placeholderTextColor={theme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color={theme.colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      )}

      {!isSearching && (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('AddBreed')}
          >
            <Plus color={theme.colors.white} size={20} style={styles.plusIcon} />
            <Text style={styles.addButtonText}>Add New Breed</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredBreeds}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <SearchX size={64} color={theme.colors.border} />
                <Text style={[styles.noRecords, { color: theme.colors.text }]}>No Breeds Found</Text>
                <Text style={[styles.emptyDesc, { color: theme.colors.textLight }]}>Register different breeds to categorize your livestock.</Text>
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
    backgroundColor: '#FFFFFF',
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    ...lightTheme.shadow.sm,
    zIndex: 5,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
    fontFamily: 'Montserrat_500Medium',
  },
  actionRow: {
    padding: 16,
    paddingBottom: 8,
    alignItems: 'flex-end',
    maxWidth: 768,
    width: '100%',
    alignSelf: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    ...lightTheme.shadow.sm,
  },
  plusIcon: {
    marginRight: 8,
  },
  addButtonText: {
    color: 'white',
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    maxWidth: 768,
    width: '100%',
    alignSelf: 'center',
  },
  breedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  breedInfo: {
    flex: 1,
  },
  breedName: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#1F2937',
  },
  animalType: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'Montserrat_500Medium',
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 40,
  },
  noRecords: {
    fontSize: 18,
    fontFamily: 'Montserrat_500Medium',
    marginTop: 16,
  },
  emptyDesc: {
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    fontFamily: 'Montserrat_400Regular',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BreedListScreen;
