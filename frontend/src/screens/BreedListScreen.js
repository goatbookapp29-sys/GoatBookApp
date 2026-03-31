import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Animated, Platform, Alert, SafeAreaView, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { lightTheme } from '../theme';
import GHeader from '../components/GHeader';
import { Search, Plus, ChevronRight, X, SearchX, Square, CheckSquare, Trash2, CheckCircle2, Lock, Check } from 'lucide-react-native';
import api from '../api';
import { useFocusEffect } from '@react-navigation/native';
import { getFromCache, saveToCache } from '../utils/cache';

const BreedListScreen = ({ navigation }) => {
  const { isDarkMode, theme } = useTheme();
  const styles = useMemo(() => getStyles(theme, isDarkMode), [theme, isDarkMode]);
  const [breeds, setBreeds] = useState([]);
  const [filteredBreeds, setFilteredBreeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selection State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  
  const searchBarTranslateY = useRef(new Animated.Value(-100)).current;

  useFocusEffect(
    useCallback(() => {
      fetchBreeds();
      exitSelectionMode();
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

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  const handleLongPress = (item) => {
    if (!item.isDefault) {
      if (!isSelectionMode) {
        setIsSelectionMode(true);
        setSelectedIds([item.id]);
      }
    } else {
      Alert.alert('System Breed', 'This is a default breed provided by GoatBook and cannot be deleted.');
    }
  };

  const toggleSelection = (id) => {
    if (selectedIds.includes(id)) {
      const next = selectedIds.filter(idx => idx !== id);
      setSelectedIds(next);
      if (next.length === 0) setIsSelectionMode(false);
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    const selectable = filteredBreeds.filter(b => !b.isDefault).map(b => b.id);
    if (selectable.length === 0) {
      Alert.alert('Selection', 'No custom breeds available to select.');
      return;
    }
    
    if (selectedIds.length === selectable.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(selectable);
    }
  };

  const handleBulkDelete = (source = 'unknown') => {
    // DIAGNOSTIC ALERT
    Alert.alert('Action Triggered', `Delete requested from: ${source}\nSelected items: ${selectedIds.length}`);
    
    if (selectedIds.length === 0) {
        Alert.alert('Selection', 'Please select at least one custom breed to delete.');
        return;
    }

    const isMultiple = selectedIds.length > 1;
    const message = isMultiple 
        ? `Do you want to delete these breeds? Are you sure?`
        : `Do you want to delete this breed? Are you sure?`;

    Alert.alert(
      isMultiple ? 'Delete Breeds' : 'Delete Breed',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              console.log('Sending delete request for:', selectedIds);
              const response = await api.delete('/breeds/bulk', { data: { ids: selectedIds } });
              console.log('Delete success:', response.data);
              await fetchBreeds();
              exitSelectionMode();
            } catch (error) {
              console.error('Delete error:', error);
              const msg = error.response?.data?.message || 'Delete failed';
              Alert.alert('Error', msg);
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedIds.includes(item.id);
    const isCustom = !item.isDefault;

    return (
      <TouchableOpacity 
        style={[
          styles.breedCard, 
          isSelected && { borderColor: theme.colors.primary, backgroundColor: isDarkMode ? '#1E1E1E' : '#fafafa' }
        ]}
        onPress={() => isSelectionMode ? (isCustom ? toggleSelection(item.id) : null) : navigation.navigate('BreedDetails', { breedId: item.id })}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.breedInfo}>
          <Text style={[styles.breedName, { color: theme.colors.text }]}>{item.name}</Text>
          <Text style={[styles.animalType, { color: theme.colors.textLight }]}>{item.animalType}</Text>
        </View>
        {isSelectionMode ? (
          <View style={styles.checkboxWrapper}>
            {isCustom ? (
              <View style={[
                styles.checkbox, 
                isSelected ? styles.checkboxSelected : styles.checkboxUnselected,
                isSelected && { backgroundColor: '#007AFF', borderColor: '#007AFF' }
              ]}>
                {isSelected && <Check size={14} color="white" strokeWidth={3} />}
              </View>
            ) : (
              <Lock size={18} color={theme.colors.textMuted} />
            )}
          </View>
        ) : (
          <ChevronRight size={20} color={theme.colors.textMuted} />
        )}
      </TouchableOpacity>
    );
  };

  const isAllSelected = selectedIds.length > 0 && selectedIds.length === filteredBreeds.filter(b => !b.isDefault).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {isSelectionMode ? (
        <View style={styles.selectionHeader}>
            <TouchableOpacity onPress={exitSelectionMode} style={styles.headerButton}>
                <Text style={[styles.headerButtonText, { color: '#007AFF' }]}>Cancel</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[styles.selectionTitle, { color: theme.colors.text }]}>
                    {selectedIds.length === 0 ? 'Select items' : `${selectedIds.length} selected`}
                </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => handleBulkDelete('Header')} style={[styles.headerButton, { marginRight: 10 }]} disabled={selectedIds.length === 0}>
                    <Trash2 color={selectedIds.length > 0 ? theme.colors.primary : theme.colors.textMuted} size={22} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSelectAll} style={styles.headerButton}>
                    <Text style={[styles.headerButtonText, { color: '#007AFF' }]}>
                        {isAllSelected ? 'None' : 'All'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
      ) : (
        <GHeader 
          title="Breeds List" 
          onMenu={() => navigation.openDrawer()} 
          onBack={() => navigation.goBack()}
          rightIcon={
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setIsSelectionMode(true)} style={{ marginRight: 15 }}>
                    <CheckSquare color={theme.colors.white} size={22} />
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleSearch}>
                    {isSearching ? <X color={theme.colors.white} size={24} /> : <Search color={theme.colors.white} size={24} />}
                </TouchableOpacity>
            </View>
          }
        />
      )}
      
      {isSearching && (
        <Animated.View style={[styles.searchBarContainer, { transform: [{ translateY: searchBarTranslateY }] }]}>
          <View style={styles.searchInner}>
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

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <>
          <FlatList
            data={filteredBreeds}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            ListHeaderComponent={
              !isSearching && !isSelectionMode ? (
                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={[styles.addButton, { backgroundColor: theme.colors.primary, ...theme.shadow.sm }]}
                    onPress={() => navigation.navigate('AddBreed')}
                  >
                    <Plus color={theme.colors.white} size={20} style={styles.plusIcon} />
                    <Text style={styles.addButtonText}>Add New Breed</Text>
                  </TouchableOpacity>
                </View>
              ) : null
            }
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
          
          {isSelectionMode && (
            <View style={styles.bottomActions}>
                <Pressable 
                    style={({ pressed }) => [styles.deleteAction, { opacity: pressed ? 0.6 : 1 }]}
                    onPress={() => handleBulkDelete('BottomBar')}
                    disabled={selectedIds.length === 0}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                    <Trash2 size={24} color={selectedIds.length > 0 ? theme.colors.primary : theme.colors.textMuted} />
                    <Text style={[styles.deleteActionText, { color: selectedIds.length > 0 ? theme.colors.primary : theme.colors.textMuted }]}>
                        Delete
                    </Text>
                </Pressable>
                <Pressable 
                    style={({ pressed }) => [styles.actionPlaceholder, { opacity: pressed ? 0.6 : 1 }]} 
                    onPress={exitSelectionMode}
                    hitSlop={{ top: 10, bottom: 20, left: 20, right: 20 }}
                >
                    <X size={24} color={theme.colors.textMuted} />
                    <Text style={[styles.deleteActionText, { color: theme.colors.textMuted }]}>Cancel</Text>
                </Pressable>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: Platform.OS === 'ios' ? 100 : 70,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingTop: Platform.OS === 'ios' ? 40 : 0,
  },
  headerButton: {
    paddingVertical: 10,
    minWidth: 70,
  },
  headerButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  selectionTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_700Bold',
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    zIndex: 5,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: theme.colors.background,
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
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
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
    paddingBottom: 100,
    maxWidth: 768,
    width: '100%',
    alignSelf: 'center',
  },
  breedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  checkboxWrapper: {
    marginLeft: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxUnselected: {
    borderColor: theme.colors.border,
    backgroundColor: 'transparent',
  },
  checkboxSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  breedInfo: {
    flex: 1,
  },
  breedName: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  animalType: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'Montserrat_500Medium',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 80,
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
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 20, 
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    zIndex: 9999, // Maximum priority
    elevation: 100, // Maximum visibility for Android
    ...theme.shadow.lg,
  },
  deleteAction: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  actionPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  deleteActionText: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Montserrat_600SemiBold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BreedListScreen;
