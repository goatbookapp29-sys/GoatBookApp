import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Animated, Platform, Alert, SafeAreaView } from 'react-native';
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
      await saveToCache('breeds', response.data);
      setBreeds(response.data);
      setFilteredBreeds(response.data);
      setLoading(false);
    } catch (error) {
      console.warn('Fetch breeds failed', error);
      const cachedData = await getFromCache('breeds');
      if (cachedData) {
        setBreeds(cachedData);
        setFilteredBreeds(cachedData);
      }
      setLoading(false);
    }
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedIds([]);
  };

  const safeAlert = (title, message, buttons) => {
    console.log(`ALERT: ${title} - ${message}`);
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`${title}: ${message}`);
      if (confirmed && buttons && buttons[1] && buttons[1].onPress) {
        buttons[1].onPress();
      }
    } else {
      Alert.alert(title, message, buttons);
    }
  };

  const handleLongPress = (item) => {
    if (!item.isDefault) {
      if (!isSelectionMode) {
        setIsSelectionMode(true);
        setSelectedIds([item.id]);
      }
    } else {
      safeAlert('System Breed', 'This is a default breed and cannot be deleted.', [{ text: 'OK' }]);
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
    if (selectable.length === 0) return;
    if (selectedIds.length === selectable.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(selectable);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;

    const isMultiple = selectedIds.length > 1;
    const message = isMultiple 
        ? `Do you want to delete these breeds? Are you sure?`
        : `Do you want to delete this breed? Are you sure?`;

    safeAlert(
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
              await api.delete('/breeds/bulk', { data: { ids: selectedIds } });
              await fetchBreeds();
              exitSelectionMode();
            } catch (error) {
              const msg = error.response?.data?.message || 'Delete failed';
              safeAlert('Error', msg, [{ text: 'OK' }]);
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]} pointerEvents="box-none">
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
            <TouchableOpacity onPress={handleSelectAll} style={styles.headerButton}>
                <Text style={[styles.headerButtonText, { color: '#007AFF' }]}>
                    {isAllSelected ? 'None' : 'All'}
                </Text>
            </TouchableOpacity>
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
                <TouchableOpacity onPress={() => { setIsSearching(!isSearching); if(!isSearching) setSearchQuery(''); }}>
                    {isSearching ? <X color={theme.colors.white} size={24} /> : <Search color={theme.colors.white} size={24} />}
                </TouchableOpacity>
            </View>
          }
        />
      )}
      
      {isSearching && (
        <View style={styles.searchBarContainer}>
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
          </View>
        </View>
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
              </View>
            }
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          />
          
          {isSelectionMode && (
            <View style={styles.bottomActions}>
                <TouchableOpacity 
                    style={styles.deleteAction}
                    onPress={handleBulkDelete}
                    disabled={selectedIds.length === 0}
                >
                    <Trash2 size={26} color={selectedIds.length > 0 ? theme.colors.primary : theme.colors.textMuted} />
                    <Text style={[styles.deleteText, { color: selectedIds.length > 0 ? theme.colors.primary : theme.colors.textMuted }]}>
                        Delete
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteAction} onPress={exitSelectionMode}>
                    <X size={26} color={theme.colors.textMuted} />
                    <Text style={[styles.deleteText, { color: theme.colors.textMuted }]}>Cancel</Text>
                </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: { flex: 1 },
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
  searchBarContainer: { padding: 10, backgroundColor: theme.colors.surface },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: theme.colors.background,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Montserrat_500Medium' },
  actionRow: { padding: 16, flexDirection: 'row', justifyContent: 'flex-end' },
  addButton: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14 },
  addButtonText: { color: 'white', fontFamily: 'Montserrat_600SemiBold', fontSize: 14, marginLeft: 8 },
  listContent: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 120 },
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
  checkboxWrapper: { marginLeft: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  checkboxUnselected: { borderColor: theme.colors.border },
  checkboxSelected: { borderColor: '#007AFF', backgroundColor: '#007AFF' },
  breedInfo: { flex: 1 },
  breedName: { fontSize: 16, fontFamily: 'Montserrat_600SemiBold' },
  animalType: { fontSize: 14, marginTop: 4, fontFamily: 'Montserrat_500Medium' },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  noRecords: { fontSize: 18, fontFamily: 'Montserrat_500Medium', marginTop: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
});

export default BreedListScreen;
