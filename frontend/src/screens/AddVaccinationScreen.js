import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import GHeader from '../components/GHeader';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import GSelect from '../components/GSelect';
import GDatePicker from '../components/GDatePicker';
import { Plus, X, Search, CheckCircle2 } from 'lucide-react-native';
import api from '../api';
import { useFocusEffect } from '@react-navigation/native';

const AddVaccinationScreen = ({ navigation, route }) => {
  const mode = route.params?.mode || 'single';
  const isMass = mode === 'mass';

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [vaccineId, setVaccineId] = useState('');
  const [daysBetween, setDaysBetween] = useState('0');
  const [validTill, setValidTill] = useState('');
  const [remark, setRemark] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [selectedAnimals, setSelectedAnimals] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  
  // UI Data
  const [vaccines, setVaccines] = useState([]);
  const [allAnimals, setAllAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchVaccines();
      fetchAnimals();
      fetchRecentRecords();
      
      if (route.params?.preSelectedAnimal) {
        setSelectedAnimals([route.params.preSelectedAnimal]);
      }
    }, [route.params])
  );

  const fetchRecentRecords = async () => {
    try {
      setRecordsLoading(true);
      const response = await api.get('/vaccines/records');
      setRecentRecords(response.data.slice(0, 10)); // Show last 10
    } catch (error) {
      console.error('Fetch recent records error:', error);
    } finally {
      setRecordsLoading(false);
    }
  };

  // Auto-fill daysBetween from selected vaccine
  useEffect(() => {
    if (vaccineId) {
      const selected = vaccines.find(v => v.value === vaccineId);
      if (selected) {
        setDaysBetween(selected.daysBetween.toString());
        
        // Auto-calculate validTill if daysBetween > 0
        if (selected.daysBetween > 0) {
          const baseDate = new Date(date);
          baseDate.setDate(baseDate.getDate() + selected.daysBetween);
          setValidTill(baseDate.toISOString().split('T')[0]);
        }
      }
    }
  }, [vaccineId, date, vaccines]);

  const fetchVaccines = async () => {
    try {
      const response = await api.get('/vaccines');
      setVaccines(response.data.map(v => ({ 
        label: v.name, 
        value: v.id, 
        daysBetween: v.daysBetween 
      })));
    } catch (error) {
      console.error('Fetch vaccines error:', error);
    }
  };

  const fetchAnimals = async () => {
    try {
      const response = await api.get('/animals');
      setAllAnimals(response.data);
    } catch (error) {
      console.error('Fetch animals error:', error);
    }
  };

  const handleAddAnimalByTag = () => {
    if (!tagInput.trim()) return;
    
    setSearching(true);
    const animal = allAnimals.find(a => 
      a.tagNumber.toLowerCase() === tagInput.trim().toLowerCase()
    );

    if (animal) {
      if (!selectedAnimals.find(a => a.id === animal.id)) {
        if (!isMass) {
          setSelectedAnimals([animal]); // single mode only one
        } else {
          setSelectedAnimals([...selectedAnimals, animal]);
        }
        setTagInput('');
      } else {
        Alert.alert('Duplicate!', 'Animal already added to the list.');
      }
    } else {
      Alert.alert('Not Found!', `No animal with tag ${tagInput} found.`);
    }
    setSearching(false);
  };

  const removeAnimal = (id) => {
    setSelectedAnimals(selectedAnimals.filter(a => a.id !== id));
  };

  const handleSave = async () => {
    let currentSelected = [...selectedAnimals];

    // AUTO-ADD: If user typed a tag but forgot to click 'ADD', try to find it now
    if (tagInput.trim() && currentSelected.length === 0) {
      const animal = allAnimals.find(a => 
        a.tagNumber.toLowerCase() === tagInput.trim().toLowerCase()
      );
      if (animal) {
        currentSelected = [animal];
        setSelectedAnimals(currentSelected); // Update state for UI
      }
    }

    if (!vaccineId || currentSelected.length === 0 || !date) {
      Alert.alert('Error', 'Please fill all required fields and select at least one animal (Hit ADD if entering Tag ID manually)');
      return;
    }

    setLoading(true);
    try {
      await api.post('/vaccines/records', {
        vaccineId,
        animalIds: currentSelected.map(a => a.id),
        date,
        validTill: validTill || null,
        remark
      });
      setLoading(false);
      Alert.alert('Success', `${isMass ? 'Mass' : 'Single'} vaccination recorded successfully`);
      
      // Reset form fields
      setSelectedAnimals([]);
      setRemark('');
      setTagInput('');
      fetchRecentRecords(); // Refresh the list below
    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.message || 'Failed to record vaccination';
      Alert.alert('Error', msg);
    }
  };

  return (
    <View style={styles.container}>
      <GHeader 
        title={isMass ? "Add Mass Vaccination" : "Add Vaccination"} 
        onBack={() => navigation.goBack()} 
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formCard}>
            <GDatePicker 
              label="Date*" 
              value={date} 
              onDateChange={setDate}
              required
            />

            <GSelect 
              label="Vaccine Name*" 
              value={vaccineId} 
              onSelect={setVaccineId}
              options={vaccines}
              placeholder="Select vaccine..."
              required
            />

            <View style={styles.inlineStats}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Given Every</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{daysBetween}</Text>
                </View>
                <Text style={styles.statSuffix}>Days</Text>
              </View>
            </View>

            <GDatePicker 
              label="Vaccine valid till" 
              value={validTill} 
              onDateChange={setValidTill}
              placeholder="Auto-calculated if cyclic"
            />

            <GInput 
              label="Remark" 
              value={remark} 
              onChangeText={setRemark} 
              placeholder="Add notes..."
              multiline
              style={{ minHeight: 60, paddingTop: 10 }}
            />

            <Text style={styles.sectionTitle}>
              {isMass ? "Animals to Vaccinate" : "Select Animal"}
            </Text>

            <View style={styles.tagInputRow}>
              <GInput 
                containerStyle={styles.tagInputBox}
                value={tagInput} 
                onChangeText={setTagInput} 
                placeholder="Scan or Enter Tag Id*"
                keyboardType="default"
              />
              <TouchableOpacity 
                style={styles.addTagBtn} 
                onPress={handleAddAnimalByTag}
                disabled={searching}
              >
                {searching ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.addTagBtnText}>ADD</Text>}
              </TouchableOpacity>
            </View>

            {/* List of selected animals */}
            {selectedAnimals.length > 0 && (
              <View style={styles.selectedContainer}>
                {selectedAnimals.map(animal => (
                  <View key={animal.id} style={styles.animalChip}>
                    <CheckCircle2 size={16} color={COLORS.success} />
                    <Text style={styles.chipText}>{animal.tagNumber}</Text>
                    <TouchableOpacity onPress={() => removeAnimal(animal.id)}>
                      <X size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {isMass && selectedAnimals.length === 0 && (
              <Text style={styles.emptyText}>No animals selected. Add animals by tag number or scan.</Text>
            )}
          </View>

          <View style={styles.footer}>
            <GButton 
              title="SAVE" 
              onPress={handleSave} 
              loading={loading}
              containerStyle={styles.saveBtn}
            />
          </View>

          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent Records</Text>
            {recordsLoading ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : recentRecords.length > 0 ? (
              recentRecords.map((item) => (
                <View key={item.id} style={styles.recentItem}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemVaccine}>{item.vaccine?.name}</Text>
                    <Text style={styles.itemDate}>{item.date}</Text>
                  </View>
                  <View style={styles.itemSubHeader}>
                    <Text style={styles.itemTag}>Tag: {item.animal?.tagNumber}</Text>
                    {item.nextDueDate && (
                      <Text style={styles.itemDue}>Due: {item.nextDueDate}</Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No recent records found</Text>
            )}
            
            <TouchableOpacity 
              style={styles.viewAllBtn}
              onPress={() => navigation.navigate('VaccinationList')}
            >
              <Text style={styles.viewAllBtnText}>View All Historical Records →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  formCard: {
    paddingBottom: SPACING.md,
  },
  inlineStats: {
    marginBottom: SPACING.md,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  statSuffix: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginVertical: SPACING.md,
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInputBox: {
    flex: 1,
    marginRight: 10,
    marginBottom: 0,
  },
  addTagBtn: {
    backgroundColor: '#1E40AF', // Darker Blue as shown in UI
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.sm,
  },
  addTagBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  selectedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.md,
  },
  animalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#0369A1',
  },
  emptyText: {
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  footer: {
    marginTop: 20,
  },
  saveBtn: {
    backgroundColor: '#1E40AF',
  },
  recentSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  recentItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemVaccine: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  itemDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  itemSubHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemTag: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  itemDue: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '600',
  },
  viewAllBtn: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  viewAllBtnText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  }
});

export default AddVaccinationScreen;
