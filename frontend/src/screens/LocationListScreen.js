import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Animated, Platform, SafeAreaView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import GHeader from '../components/GHeader';
import { Search, Plus, ChevronRight, MapPin, X, SearchX, LayoutGrid, Home, Settings } from 'lucide-react-native';
import api from '../api';
import { useFocusEffect } from '@react-navigation/native';
import { SPACING, SHADOW } from '../theme';
import GInput from '../components/GInput';

const LocationListScreen = ({ navigation }) => {
  const { isDarkMode, theme } = useTheme();
  const styles = useMemo(() => getStyles(theme, isDarkMode), [theme, isDarkMode]);
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
        loc.name?.toLowerCase().includes(q) ||
        loc.displayName?.toLowerCase().includes(q) ||
        loc.code?.toLowerCase().includes(q)
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

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.locationCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={() => navigation.navigate('LocationDetails', { locationId: item.id })}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '10' }]}>
        <LayoutGrid size={22} color={theme.colors.primary} />
      </View>
      <View style={styles.locationInfo}>
        <Text style={[styles.locationName, { color: theme.colors.text }]} numberOfLines={1}>
          {item.displayName || item.name}
        </Text>
        <Text style={[styles.locationMeta, { color: theme.colors.textLight }]}>
          {item.animalCount || 0} Animals • {item.code || 'Shed'}
        </Text>
      </View>
      <ChevronRight size={18} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );

  const searchInputRef = useRef(null);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const handleSearchPress = () => {
    setIsSearchVisible(!isSearchVisible);
    if (!isSearchVisible) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GHeader 
        title="Shed List" 
        onBack={() => navigation.goBack()}
        leftAlign={true}
        rightIcon={isSearchVisible ? <X size={24} color="#FFF" /> : <Search size={24} color="#FFF" />}
        onRightPress={handleSearchPress}
      />

      <View style={styles.content}>
        {/* Modern Toggleable Search Bar */}
        {isSearchVisible && (
          <View style={styles.searchContainer}>
            <GInput 
              ref={searchInputRef}
              placeholder="Search sheds..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftIcon={<Search size={20} color={theme.colors.textMuted} />}
            />
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
                  <Text style={[styles.noRecords, { color: theme.colors.text }]}>No Sheds Found</Text>
                  <Text style={[styles.emptyDesc, { color: theme.colors.textLight }]}>
                    Add your farm's physical structure to start managing locations.
                  </Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('CreateLocation')}
        activeOpacity={0.8}
      >
        <Plus color="#FFF" size={32} strokeWidth={2} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 8,
    paddingBottom: 16,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: 100,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    ...SHADOW.sm,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: -0.3,
  },
  locationMeta: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
    opacity: 0.8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  noRecords: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 16,
  },
  emptyDesc: {
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 40,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.lg,
  }
});

export default LocationListScreen;
