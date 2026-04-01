import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, View, Text, TouchableOpacity, FlatList, 
  SafeAreaView, Modal, TextInput, Alert, ActivityIndicator, Platform 
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import GHeader from '../components/GHeader';
import GButton from '../components/GButton';
import { ChevronDown, Check } from 'lucide-react-native';
import { SPACING } from '../theme';
import api from '../api';

const MassLocationScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const styles = useMemo(() => getStyles(theme, isDarkMode), [theme, isDarkMode]);

  const [animals, setAnimals] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedAnimals, setSelectedAnimals] = useState(new Set());
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);
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
      setLocations(locationsRes.data);
    } catch (error) {
      console.error('Fetch data error:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const toggleAnimalSelection = (id) => {
    const newSelection = new Set(selectedAnimals);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedAnimals(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedAnimals.size === animals.length) {
      setSelectedAnimals(new Set());
    } else {
      setSelectedAnimals(new Set(animals.map(a => a.id)));
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
      setLocations([...locations, res.data]);
      setSelectedLocation(res.data);
      setNewLocationName('');
      setShowAddLocation(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to create location');
    }
  };

  const handleSubmit = async () => {
    if (selectedAnimals.size === 0) {
      Alert.alert('Error', 'Please select atleast one animal');
      return;
    }
    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location');
      return;
    }

    setSubmitting(true);
    try {
      await api.put('/animals/bulk-location', {
        animalIds: Array.from(selectedAnimals),
        locationId: selectedLocation.id
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
        style={styles.animalItem} 
        onPress={() => toggleAnimalSelection(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, isChecked && styles.checkboxSelected]}>
          {isChecked && <Check color="#FFF" size={14} strokeWidth={4} />}
        </View>
        <View style={styles.animalDetails}>
          <View style={styles.animalRow}>
            <Text style={styles.tagText}>Tag ID:{item.tagNumber}</Text>
            <Text style={styles.breedText}>{item.Breed?.name || 'Unknown'}</Text>
          </View>
          <View style={styles.subTextRow}>
            <Text style={styles.subText}>{item.gender}</Text>
            <Text style={styles.subText}>Age (M) : {item.ageInMonths || '0'}</Text>
            <Text style={styles.subText}>Weight : {item.currentWeight || item.birthWeight || '0'}</Text>
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GHeader title="Add Mass Location/Shed" onBack={() => navigation.goBack()} />

      <View style={styles.selectionRow}>
        <TouchableOpacity 
          style={styles.pickerTrigger}
          onPress={() => setShowLocationPicker(true)}
        >
          <View style={styles.pickerLabelContainer}>
             <Text style={styles.pickerLabel} numberOfLines={1}>
                {selectedLocation ? selectedLocation.name : 'Select Location Shed'}
             </Text>
             <ChevronDown color={theme.colors.textMuted} size={20} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
           style={styles.addShedBtn}
           onPress={() => setShowAddLocation(true)}
        >
           <Text style={styles.addShedBtnText}>Add New Location</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.selectAllRow}
        onPress={handleSelectAll}
        activeOpacity={0.7}
      >
         <View style={[styles.checkboxRect, selectedAnimals.size === animals.length && styles.checkboxRectSelected]}>
            {selectedAnimals.size === animals.length && <Check color="#FFF" size={14} strokeWidth={3} />}
         </View>
         <Text style={styles.selectAllText}>Select All</Text>
      </TouchableOpacity>

      <FlatList 
        data={animals}
        renderItem={renderAnimalItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <View style={styles.footer}>
         <GButton 
            title="Submit"
            onPress={handleSubmit}
            loading={submitting}
         />
      </View>

      {/* Location Picker Modal (Image 6) */}
      <Modal visible={showLocationPicker} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowLocationPicker(false)}
        >
          <View style={styles.pickerModalContent}>
            <View style={[styles.modalHeader, { backgroundColor: theme.colors.primary }]}>
               <Text style={styles.modalHeaderText}>Select Location/Shed</Text>
            </View>
            <FlatList 
              data={locations}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.pickerItem}
                  onPress={() => {
                    setSelectedLocation(item);
                    setShowLocationPicker(false);
                  }}
                >
                  <Text style={styles.pickerItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add New Location Modal (Image 9) */}
      <Modal visible={showAddLocation} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowAddLocation(false)}
        >
          <View style={styles.addModalContent}>
            <View style={[styles.modalHeader, { backgroundColor: theme.colors.primary }]}>
               <Text style={styles.modalHeaderText}>Add Location/Shed</Text>
            </View>
            <View style={styles.addModalBody}>
               <TextInput 
                  style={styles.modalInput}
                  placeholder="Enter Location/Shed Name"
                  placeholderTextColor={theme.colors.textMuted}
                  value={newLocationName}
                  onChangeText={setNewLocationName}
                  autoFocus
               />
               <TouchableOpacity 
                  style={[styles.modalSaveBtn, { backgroundColor: theme.colors.primary }]}
                  onPress={handleAddNewLocation}
               >
                  <Text style={styles.modalSaveBtnText}>Save</Text>
               </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
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
  selectionRow: {
    flexDirection: 'row',
    padding: SPACING.md,
    alignItems: 'center',
    gap: 12,
  },
  pickerTrigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDarkMode ? '#444' : '#CCC',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 52,
  },
  pickerLabelContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerLabel: {
    color: theme.colors.text,
    fontSize: 14,
  },
  addShedBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addShedBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  selectAllText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
  listContent: {
    paddingBottom: 80,
  },
  animalItem: {
    flexDirection: 'row',
    padding: SPACING.md,
    alignItems: 'center',
    backgroundColor: isDarkMode ? '#1A1A1A' : '#FFF',
  },
  animalDetails: {
    flex: 1,
    marginLeft: 12,
  },
  animalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tagText: {
    fontWeight: '700',
    fontSize: 16,
    color: theme.colors.text,
  },
  breedText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontFamily: 'Inter_500Medium',
  },
  subTextRow: {
    flexDirection: 'row',
    gap: 12,
  },
  subText: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: theme.colors.primary,
  },
  checkboxRect: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxRectSelected: {
    backgroundColor: theme.colors.primary,
  },
  separator: {
    height: 1,
    backgroundColor: isDarkMode ? '#333' : '#F0F0F0',
  },
  footer: {
    padding: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 0 : SPACING.md,
    backgroundColor: 'transparent',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  pickerModalContent: {
    backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF',
    borderRadius: 4,
    maxHeight: '60%',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 15,
    alignItems: 'center',
  },
  modalHeaderText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerItem: {
    padding: 15,
  },
  pickerItemText: {
    fontSize: 15,
    color: theme.colors.text,
  },
  addModalContent: {
    backgroundColor: isDarkMode ? '#1E1E1E' : '#FFF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  addModalBody: {
    padding: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: isDarkMode ? '#444' : '#CCC',
    borderRadius: 4,
    height: 48,
    paddingHorizontal: 12,
    color: theme.colors.text,
    marginBottom: 20,
  },
  modalSaveBtn: {
    height: 48,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSaveBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default MassLocationScreen;
