import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Animated, Platform } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import GHeader from '../components/GHeader';
import { Search, Plus, ChevronRight, MapPin, X, ChevronDown, ChevronUp } from 'lucide-react-native';
import api from '../api';
import { useFocusEffect } from '@react-navigation/native';

const LocationListScreen = ({ navigation }) => {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [locationStats, setLocationStats] = useState({});
  const [statLoading, setStatLoading] = useState(null);

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

  const toggleExpand = async (locationId) => {
    if (expandedId === locationId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(locationId);
    
    if (!locationStats[locationId]) {
      try {
        setStatLoading(locationId);
        const response = await api.get(`/locations/${locationId}/stats`);
        setLocationStats(prev => ({ ...prev, [locationId]: response.data }));
        setStatLoading(null);
      } catch (error) {
        console.error('Fetch location stats error:', error);
        setStatLoading(null);
      }
    }
  };

  const renderDistribution = (locationId) => {
    if (statLoading === locationId) {
      return <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 10 }} />;
    }

    const data = locationStats[locationId];
    if (!data || data.distribution.length === 0) {
      return <Text style={styles.emptyStats}>No animals present here</Text>;
    }

    return (
      <View style={styles.statsContainer}>
        {data.distribution.map((item, index) => (
          <View key={index} style={styles.breedStatRow}>
            <View style={styles.breedHeader}>
              <Text style={styles.statBreedName}>{item.breedName}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.count}</Text>
              </View>
            </View>
            <View style={styles.animalList}>
              {item.animals.map((animal, aIdx) => (
                <Text key={aIdx} style={styles.animalTag}>• {animal.tagNumber} ({animal.gender})</Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <TouchableOpacity 
        style={styles.locationItem}
        onPress={() => toggleExpand(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.iconBox}>
          <MapPin size={24} color={COLORS.primary} />
        </View>
        <View style={styles.locationInfo}>
          <Text style={styles.locationName} numberOfLines={2}>{item.displayName || item.name}</Text>
          <Text style={styles.locationCode}>{item.code} • {item.type}</Text>
        </View>
        <TouchableOpacity 
          style={styles.editBtn} 
          onPress={() => navigation.navigate('EditLocation', { location: item })}
        >
          <ChevronRight size={20} color="#D1D5DB" />
        </TouchableOpacity>
        {expandedId === item.id ? <ChevronUp size={20} color={COLORS.primary} /> : <ChevronDown size={20} color="#D1D5DB" />}
      </TouchableOpacity>
      
      {expandedId === item.id && (
        <View style={styles.expandedContent}>
          {renderDistribution(item.id)}
        </View>
      )}
    </View>
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
          ListEmptyComponent={<Text style={styles.noRecords}>No Locations Found</Text>}
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
    backgroundColor: '#F3F4F6',
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
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFF1EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  locationCode: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  editBtn: {
    padding: 8,
    marginRight: 4,
  },
  expandedContent: {
    backgroundColor: '#FAFBFD',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    padding: 16,
  },
  statsContainer: {
    gap: 12,
  },
  emptyStats: {
    textAlign: 'center',
    color: COLORS.textLight,
    padding: 10,
    fontStyle: 'italic',
  },
  breedStatRow: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    ...SHADOW.sm,
  },
  breedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statBreedName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  animalList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  animalTag: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  noRecords: {
    textAlign: 'center',
    marginTop: 40,
    color: COLORS.textLight,
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LocationListScreen;
