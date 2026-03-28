import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Animated, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { lightTheme } from '../theme';
import GHeader from '../components/GHeader';
import { Search, Plus, ChevronRight, MapPin, X, SearchX } from 'lucide-react-native';
import api from '../api';
import { useFocusEffect } from '@react-navigation/native';

const LocationListScreen = ({ navigation }) => {
  const { isDarkMode, theme } = useTheme();
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchBarTranslateY = useRef(new Animated.Value(-100)).current;

  useFocusEffect(
    useCallback(() => {
      fetchLocations();
    }, [])
  );

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLocations(locations);
    } else {
      const q = searchQuery.toLowerCase();
      const filtered = locations.filter(loc => 
        loc.name.toLowerCase().includes(q) ||
        loc.code.toLowerCase().includes(q) ||
        (loc.displayName && loc.displayName.toLowerCase().includes(q)) ||
        loc.type.toLowerCase().includes(q)
      );
      setFilteredLocations(filtered);
    }
  }, [searchQuery, locations]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/locations');
      setLocations(response.data);
      setFilteredLocations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch locations error:', error);
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
      style={[styles.locationCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={() => navigation.navigate('LocationDetails', { locationId: item.id })}
      activeOpacity={0.7}
    >

      <View style={styles.locationInfo}>
        <Text style={[styles.locationName, { color: theme.colors.text }]} numberOfLines={1}>{item.displayName || item.name}</Text>
        <Text style={[styles.locationMeta, { color: theme.colors.textLight }]}>{item.code} • {item.type}</Text>
      </View>
      <ChevronRight size={20} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GHeader 
        title="Location List" 
        onMenu={() => navigation.openDrawer()} 
        rightIcon={isSearching ? <X color={theme.colors.white} size={24} /> : <Search color={theme.colors.white} size={24} />}
        onRightPress={toggleSearch}
      />

      {isSearching && (
        <Animated.View style={[styles.searchBarContainer, { backgroundColor: theme.colors.surface, transform: [{ translateY: searchBarTranslateY }] }]}>
          <View style={[styles.searchInner, { backgroundColor: theme.colors.background }]}>
            <Search size={20} color={theme.colors.textLight} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search code, name or type..."
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
            onPress={() => navigation.navigate('AddLocation')}
          >
            <Plus color={theme.colors.white} size={20} style={styles.plusIcon} />
            <Text style={styles.addButtonText}>Add Location</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredLocations}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <SearchX size={64} color={theme.colors.border} />
                <Text style={[styles.noRecords, { color: theme.colors.text }]}>No Locations Found</Text>
                <Text style={[styles.emptyDesc, { color: theme.colors.textLight }]}>Add stables, pens, or sections to organize your farm.</Text>
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
    paddingBottom: 40,
    paddingTop: 16,
  },
  locationCard: {
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
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#1F2937',
  },
  locationMeta: {
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

export default LocationListScreen;
