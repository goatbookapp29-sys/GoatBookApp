import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, FlatList, 
  SafeAreaView, Modal, TextInput, Alert, ActivityIndicator, Platform 
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import GHeader from '../components/GHeader';
import GButton from '../components/GButton';
import GSelect from '../components/GSelect';
import { 
  Check, Square, CheckSquare, Circle, CheckCircle2, Scan, ChevronDown, 
  Search, X 
} from 'lucide-react-native';
import { SPACING, SHADOW } from '../theme';
import api from '../api';

const MassLocationScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const styles = useMemo(() => getStyles(theme, isDarkMode), [theme, isDarkMode]);

  const [animals, setAnimals] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedAnimals, setSelectedAnimals] = useState(new Set());
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [animalsRes, locationsRes] = await Promise.all([
        api.get('/animals'),
        api.get('/locations')
      ]);
      setAnimals(animalsRes.data);
      setLocations(locationsRes.data.map(loc => ({
        label: `${loc.displayName || loc.name} (${loc.animalCount || 0})`,
        value: loc.id
      })));
    } catch (error) {
      console.error('Fetch data error:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const toggleAnimalSelection = useCallback((id) => {
    setSelectedAnimals(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [remark, setRemark] = useState('');

  const filteredAnimals = useMemo(() => {
    let result = animals;
    
    // 1. Filter by search query (Tag ID or Breed)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(animal => 
        animal.tagNumber?.toLowerCase().includes(q) || 
        (animal.breeds?.name || '').toLowerCase().includes(q)
      );
    }
    
    // 2. Auto-exclude animals already in the target shed
    if (selectedLocationId) {
      result = result.filter(animal => animal.locationId !== selectedLocationId);
    }
    
    return result;
  }, [animals, searchQuery, selectedLocationId]);

  const handleSelectAll = () => {
    if (selectedAnimals.size === filteredAnimals.length) {
      setSelectedAnimals(new Set());
    } else {
      setSelectedAnimals(new Set(filteredAnimals.map(a => a.id)));
    }
  };

  const handleAddNewLocation = async () => {
    if (!newLocationName.trim()) return;
    try {
      const res = await api.post('/locations', {
        name: newLocationName,
        code: newLocationName.toUpperCase().substring(0, 5),
        type: 'Internal Location'
      });
      const newLoc = {
        label: `${res.data.name} (0)`,
        value: res.data.id
      };
      setLocations(prev => [...prev, newLoc]);
      setSelectedLocationId(res.data.id);
      setNewLocationName('');
      setShowAddModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to create location');
    }
  };

  const handleSubmit = async () => {
    if (selectedAnimals.size === 0) {
      Alert.alert('Validation', 'Please select atleast one animal');
      return;
    }
    if (!selectedLocationId) {
      Alert.alert('Validation', 'Please select a destination location');
      return;
    }

    setSubmitting(true);
    try {
      await api.put('/animals/bulk-location', {
        animalIds: Array.from(selectedAnimals),
        locationId: selectedLocationId,
        remark: remark
      });
      Alert.alert('Success', 'Location updated for selected animals');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update location');
    } finally {
      setSubmitting(false);
    }
  };

  const renderAnimalItem = ({ item }) => {
    const isChecked = selectedAnimals.has(item.id);
    return (
      <TouchableOpacity 
        style={[styles.animalItem, { borderBottomColor: theme.colors.border + '30' }]} 
        onPress={() => toggleAnimalSelection(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.checkWrapper}>
          {isChecked ? (
            <CheckCircle2 color={theme.colors.primary} size={24} fill={theme.colors.primary + '20'} />
          ) : (
            <Circle color={theme.colors.textMuted} size={24} />
          )}
        </View>
        <View style={styles.animalInfo}>
          <View style={styles.infoTop}>
            <Text style={[styles.tagId, { color: theme.colors.text }]}>Tag ID:{item.tagNumber}</Text>
            <Text style={[styles.breedName, { color: theme.colors.textLight }]}>{item.breeds?.name || 'Sirohi'}</Text>
          </View>
          <View style={styles.infoBottom}>
            <Text style={[styles.metaText, { color: theme.colors.textLight }]}>{item.gender || 'Male'}</Text>
            <Text style={[styles.metaText, { color: theme.colors.primary, fontWeight: '600' }]}>
              {item.locations?.name || 'Unassigned'}
            </Text>
            <Text style={[styles.metaText, { color: theme.colors.textLight }]}>
              {item.currentWeight || item.birthWeight || 0}kg
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const isAllSelected = filteredAnimals.length > 0 && selectedAnimals.size === filteredAnimals.length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GHeader title="Add Mass Location/Shed" onBack={() => navigation.goBack()} leftAlign={true} />

      {/* Top Controls */}
      <View style={styles.controlRow}>
        <View style={styles.selectWrapper}>
          <GSelect 
            label="Target Shed" 
            placeholder="Select Destination"
            value={selectedLocationId}
            onSelect={(id) => {
              setSelectedLocationId(id);
              setSelectedAnimals(new Set()); // Clear selection when target changes to re-filter
            }}
            options={locations}
            rightIcon={<Scan size={20} color={theme.colors.textMuted} />}
          />
        </View>
        <TouchableOpacity 
          style={[styles.addLocBtn, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addLocBtnText}>+ NEW SHED</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Select All Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchInner}>
          <GInput 
            placeholder="Search Tag ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Search size={18} color={theme.colors.textMuted} />}
            containerStyle={{ marginVertical: 0 }}
          />
        </View>
        <TouchableOpacity 
          style={styles.selectAllBtn} 
          onPress={handleSelectAll}
          activeOpacity={0.7}
        >
          {isAllSelected ? (
            <CheckSquare color={theme.colors.primary} size={22} fill={theme.colors.primary + '20'} />
          ) : (
            <Square color={theme.colors.textMuted} size={22} />
          )}
          <Text style={[styles.selectAllText, { color: theme.colors.text }]}>
            {selectedAnimals.size > 0 ? `Selected (${selectedAnimals.size})` : 'All'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Animal List */}
      <FlatList 
        data={filteredAnimals}
        renderItem={renderAnimalItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.textLight }]}>
              {selectedLocationId ? 'All animals are already in this shed or none match search.' : 'Select a Target Shed to begin selection.'}
            </Text>
          </View>
        }
      />

      {/* Fixed Footer */}
      <View style={[styles.footer, { paddingBottom: Platform.OS === 'ios' ? 34 : 20 }]}>
        <GInput 
          placeholder="Bulk Remark (Optional)" 
          value={remark} 
          onChangeText={setRemark}
          containerStyle={{ marginBottom: 12 }}
        />
        <GButton 
          title={`Move ${selectedAnimals.size} Animals`}
          onPress={handleSubmit}
          loading={submitting}
          disabled={selectedAnimals.size === 0}
        />
      </View>

      {/* Add New Location Modal */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.modalHeader, { backgroundColor: theme.colors.primary }]}>
               <Text style={styles.modalHeaderText}>Add Location/Shed</Text>
            </View>
            <View style={styles.modalBody}>
               <TextInput 
                  style={[styles.modalInput, { borderColor: theme.colors.border, color: theme.colors.text }]}
                  placeholder="Enter Location/Shed Name"
                  placeholderTextColor={theme.colors.textMuted}
                  value={newLocationName}
                  onChangeText={setNewLocationName}
                  autoFocus
               />
               <TouchableOpacity 
                  style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
                  onPress={handleAddNewLocation}
               >
                  <Text style={styles.saveBtnText}>Save</Text>
               </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: 12,
    alignItems: 'flex-start',
  },
  selectWrapper: {
    flex: 1,
  },
  addLocBtn: {
    paddingHorizontal: 12,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    minWidth: 140,
  },
  addLocBtnText: {
    color: '#FFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
  },
  selectAllRow: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
  },
  selectAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectAllText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  listContent: {
    paddingBottom: 150,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 12,
  },
  searchInner: {
    flex: 1,
  },
  selectAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 100,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  animalItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  checkWrapper: {
    marginRight: 16,
  },
  animalInfo: {
    flex: 1,
  },
  infoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tagId: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  breedName: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  infoBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border + '30',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  modalContent: {
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOW.lg,
  },
  modalHeader: {
    padding: 16,
    alignItems: 'center',
  },
  modalHeaderText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  modalBody: {
    padding: 24,
  },
  modalInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    marginBottom: 20,
  },
  saveBtn: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
});

export default MassLocationScreen;
