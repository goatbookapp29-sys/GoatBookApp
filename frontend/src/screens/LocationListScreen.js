import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Animated, Platform } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import GHeader from '../components/GHeader';
import { Search, Plus, ChevronRight, MapPin, X } from 'lucide-react-native';
import api from '../api';
import { useFocusEffect } from '@react-navigation/native';

const LocationListScreen = ({ navigation }) => {
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
      style={styles.locationCard}
      onPress={() => navigation.navigate('LocationDetails', { locationId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.iconBox}>
        <MapPin size={24} color={COLORS.primary} />
      </View>
      <View style={styles.locationInfo}>
        <Text style={styles.locationName} numberOfLines={1}>{item.displayName || item.name}</Text>
        <Text style={styles.locationMeta}>{item.code} • {item.type}</Text>
      </View>
      <ChevronRight size={20} color="#D1D5DB" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <GHeader 
        title="Locations" 
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
              placeholder="Search code, name or path..."
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
            onPress={() => navigation.navigate('AddLocation')}
          >
            <Plus color={COLORS.white} size={20} style={styles.plusIcon} />
            <Text style={styles.addButtonText}>Add Location</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredLocations}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <MapPin size={64} color="#E5E7EB" />
                <Text style={styles.noRecords}>No Locations Found</Text>
                <Text style={styles.emptyDesc}>Add stables, pens, or sections to organize your farm.</Text>
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
  locationCard: {
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
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  locationMeta: {
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

export default LocationListScreen;
