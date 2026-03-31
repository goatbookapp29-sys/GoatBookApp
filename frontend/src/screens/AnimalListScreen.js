import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Animated, Platform, Image, Modal } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { lightTheme } from '../theme';
import GHeader from '../components/GHeader';
import { Search, Plus, ChevronRight, SearchX, X, MapPin, CheckSquare, Square, Trash2, CheckCircle2, Lock, Check, MoreVertical } from 'lucide-react-native';
import api from '../api';
import GAlert from '../components/GAlert';
import { useFocusEffect } from '@react-navigation/native';
import { getFromCache, saveToCache } from '../utils/cache';

const AnimalListScreen = ({ navigation, route }) => {
  const { isDarkMode, theme } = useTheme();
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const styles = useMemo(() => getStyles(theme, isDarkMode), [theme, isDarkMode]);
  const searchBarTranslateY = useRef(new Animated.Value(-100)).current;

  // Selection State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'info' });
  const showAlert = (title, message, type = 'info') => setAlertConfig({ visible: true, title, message, type });
  const hideAlert = () => setAlertConfig(prev => ({ ...prev, visible: false }));

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
    
    const { breedId, locationId, gender, isBreeder, femaleCondition, ageRange } = route.params || {};
    const now = new Date();

    // Strict filters from navigation
    if (breedId) result = result.filter(a => a.breedId === breedId);
    if (locationId) result = result.filter(a => a.locationId === locationId);
    if (gender) result = result.filter(a => a.gender === gender);
    if (isBreeder !== undefined) result = result.filter(a => a.isBreeder === isBreeder);
    if (femaleCondition) result = result.filter(a => a.femaleCondition === femaleCondition);

    if (ageRange) {
      result = result.filter(a => {
        if (!a.birthDate) return false;
        const bDate = new Date(a.birthDate);
        const age = (now.getFullYear() - bDate.getFullYear()) * 12 + (now.getMonth() - bDate.getMonth());
        
        if (ageRange === '0-3') return age >= 0 && age < 3;
        if (ageRange === '3-6') return age >= 3 && age < 6;
        if (ageRange === '6-9') return age >= 6 && age < 9;
        return true;
      });
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
      
      // Cache data
      await saveToCache('animals', response.data);
      
      setAnimals(response.data);
      setFilteredAnimals(response.data);
      setLoading(false);
    } catch (error) {
      console.warn('Fetch animals failed, looking for cache...', error);
      
      const cachedData = await getFromCache('animals');
      if (cachedData) {
        setAnimals(cachedData);
        setFilteredAnimals(cachedData);
      } else {
        console.error('No cached animals found.');
      }
      setLoading(false);
    }
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  const handleLongPress = (item) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedIds([item.id]);
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
    if (selectedIds.length === filteredAnimals.length) {
      setSelectedIds([]);
      setIsSelectionMode(false);
    } else {
      setSelectedIds(filteredAnimals.map(a => a.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setIsDeleteModalVisible(true);
  };

  const confirmBulkDelete = async () => {
    setIsDeleteModalVisible(false);
    setDeleting(true);
    try {
      await api.delete('/animals/bulk', { data: { ids: selectedIds } });
      // Success - refresh list
      await fetchAnimals();
      exitSelectionMode();
      showAlert('Deleted', `Successfully removed ${selectedIds.length} animals.`, 'success');
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to delete animals';
      showAlert('Delete Error', message, 'error');
    } finally {
      setDeleting(false);
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

  const renderItem = ({ item }) => {
    const isSelected = selectedIds.includes(item.id);
    
    return (
      <TouchableOpacity 
        style={[
          styles.animalItem, 
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          isSelected && { borderColor: theme.colors.primary, backgroundColor: isDarkMode ? '#1E1E1E' : '#fafafa' }
        ]}
        onPress={() => isSelectionMode ? toggleSelection(item.id) : navigation.navigate('EditAnimal', { animal: item })}
        onLongPress={() => handleLongPress(item)}
        activeOpacity={0.7}
      >
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.animalThumbnail} />
        ) : (
          <View style={[styles.animalThumbnail, { backgroundColor: isDarkMode ? '#222' : '#F3F4F6', justifyContent: 'center', alignItems: 'center' }]}>
             <Text style={{ fontSize: 10, color: theme.colors.textMuted }}>No Image</Text>
          </View>
        )}

        <View style={styles.animalInfo}>
          <Text style={[styles.tagNumber, { color: theme.colors.text }]}>Tag: {item.tagNumber}</Text>
          <Text style={[styles.breedName, { color: theme.colors.textLight }]}>
            {item.Breed?.name} • {item.gender ? item.gender.charAt(0).toUpperCase() + item.gender.slice(1).toLowerCase() : ''}
          </Text>
          {item.Location && (
            <View style={[styles.locationTag, { backgroundColor: isDarkMode ? '#222' : '#F3F4F6' }]}>
              <MapPin size={12} color={theme.colors.textLight} style={styles.locIcon} />
              <Text style={[styles.locationName, { color: theme.colors.textLight }]}>{item.Location.name}</Text>
            </View>
          )}
        </View>
        <View style={[styles.statusBadge, styles[`status${item.status}`]]}>
          <Text style={styles.statusText}>
            {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase() : ''}
          </Text>
        </View>
        
        {isSelectionMode ? (
          <View style={styles.checkboxWrapper}>
            <View style={[
              styles.checkbox, 
              isSelected ? styles.checkboxSelected : styles.checkboxUnselected,
              isSelected && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
            ]}>
              {isSelected && <Check size={14} color="white" strokeWidth={3} />}
            </View>
          </View>
        ) : (
          <ChevronRight size={20} color={theme.colors.textMuted} />
        )}
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <SearchX size={64} color={theme.colors.border} />
      <Text style={[styles.noRecords, { color: theme.colors.text }]}>
        {searchQuery ? "No matching animals found" : "No Animals found"}
      </Text>
      {!searchQuery && (
        <Text style={[styles.emptyDescription, { color: theme.colors.textLight }]}>
          Start managing your farm by adding your first goat or sheep. Click the button below to register an animal.
        </Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GAlert 
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={hideAlert}
      />

      {isSelectionMode ? (
        <View style={styles.selectionHeader}>
            <TouchableOpacity onPress={exitSelectionMode} style={styles.headerButton}>
                <Text style={[styles.headerButtonText, { color: theme.colors.primary }]}>Cancel</Text>
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[styles.selectionTitle, { color: theme.colors.text }]}>
                    {selectedIds.length === 0 ? 'Select items' : `${selectedIds.length} selected`}
                </Text>
            </View>
            <TouchableOpacity onPress={handleSelectAll} style={[styles.headerButton, { alignItems: 'flex-end' }]}>
                <Text style={[styles.headerButtonText, { color: theme.colors.primary }]}>
                    {selectedIds.length === filteredAnimals.length ? 'None' : 'All'}
                </Text>
            </TouchableOpacity>
        </View>
      ) : (
        <GHeader 
          title="Animals List" 
          onMenu={!navigation.canGoBack() ? () => navigation.openDrawer() : undefined} 
          onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} 
          rightIcon={isSearching ? <X color={theme.colors.white} size={24} /> : <Search color={theme.colors.white} size={24} />}
          onRightPress={toggleSearch}
        />
      )}

      {isSearching && (
        <Animated.View style={[styles.searchBarContainer, { backgroundColor: theme.colors.surface, transform: [{ translateY: searchBarTranslateY }] }]}>
          <View style={[styles.searchInner, { backgroundColor: isDarkMode ? '#000' : '#F9FAFB' }]}>
            <Search size={20} color={theme.colors.textLight} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search tag, breed or location..."
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
      
      {!isSearching && !isSelectionMode && (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('AddAnimal')}
          >
            <Plus color={theme.colors.white} size={20} style={styles.plusIcon} />
            <Text style={styles.addButtonText}>Add Animal</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <>
          <FlatList
            data={filteredAnimals}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            ListEmptyComponent={EmptyState}
            contentContainerStyle={[styles.listContent, isSearching && { paddingTop: 20 }, isSelectionMode && { paddingBottom: 120 }]}
            keyboardShouldPersistTaps="handled"
          />

          {isSelectionMode && (
            <View style={styles.bottomActions}>
              <TouchableOpacity 
                style={styles.deleteAction} 
                onPress={handleBulkDelete}
                disabled={selectedIds.length === 0}
              >
                <Trash2 color={selectedIds.length === 0 ? theme.colors.textMuted : theme.colors.error} size={24} />
                <Text style={[styles.deleteText, { color: selectedIds.length === 0 ? theme.colors.textMuted : theme.colors.error }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Bulk Delete Modal */}
          <Modal
            transparent
            visible={isDeleteModalVisible}
            animationType="fade"
            onRequestClose={() => setIsDeleteModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalIconContainer}>
                  <View style={styles.iconCircle}>
                    <Trash2 color="#F97316" size={32} />
                  </View>
                </View>
                
                <Text style={styles.modalTitle}>Confirm Delete?</Text>
                <Text style={styles.modalSubtitle}>
                  Are you sure you want to delete {selectedIds.length === 1 ? 'this animal' : `these ${selectedIds.length} animals`}? This action cannot be undone.
                </Text>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={styles.modalCancelButton} 
                    onPress={() => setIsDeleteModalVisible(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.modalDeleteButton} 
                    onPress={confirmBulkDelete}
                  >
                    <Text style={styles.modalDeleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
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
    paddingHorizontal: 15,
    height: Platform.OS === 'ios' ? 100 : 70,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingTop: Platform.OS === 'ios' ? 40 : 0,
  },
  headerButton: { padding: 10, minWidth: 60 },
  headerButtonText: { fontSize: 16, fontFamily: 'Montserrat_600SemiBold' },
  selectionTitle: { fontSize: 18, fontFamily: 'Montserrat_700Bold' },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
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
  animalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  animalThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  animalInfo: {
    flex: 1,
  },
  tagNumber: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
  },
  breedName: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'Montserrat_500Medium',
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  locIcon: {
    marginRight: 4,
  },
  locationName: {
    fontSize: 11,
    fontFamily: 'Montserrat_600SemiBold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 100,
    paddingHorizontal: 32,
  },
  noRecords: {
    fontSize: 18,
    fontFamily: 'Montserrat_500Medium',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Montserrat_400Regular',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Montserrat_600SemiBold',
    color: 'white',
  },
  statusLIVE: { backgroundColor: '#10B981' },
  statusSOLD: { backgroundColor: '#3B82F6' },
  statusDEAD: { backgroundColor: '#EF4444' },
  checkboxWrapper: { marginLeft: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  checkboxUnselected: { borderColor: theme.colors.border },
  checkboxSelected: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 85,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    zIndex: 9999,
    elevation: 100,
  },
  deleteAction: { alignItems: 'center', justifyContent: 'center', flex: 1, height: '100%' },
  deleteText: { fontSize: 12, marginTop: 4, fontFamily: 'Montserrat_600SemiBold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    ...theme.shadow.lg,
  },
  modalIconContainer: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat_700Bold',
    color: theme.colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalCancelText: {
    fontSize: 15,
    fontFamily: 'Montserrat_600SemiBold',
    color: theme.colors.primary,
  },
  modalDeleteButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDeleteText: {
    fontSize: 15,
    fontFamily: 'Montserrat_600SemiBold',
    color: 'white',
  },
});

export default AnimalListScreen;
