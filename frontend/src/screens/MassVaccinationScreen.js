import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, FlatList, TouchableOpacity, ActivityIndicator, Alert, Platform, SafeAreaView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import GHeader from '../components/GHeader';
import GButton from '../components/GButton';
import GSelect from '../components/GSelect';
import GInput from '../components/GInput';
import GDatePicker from '../components/GDatePicker';
import { Check, Square, CheckSquare, Circle, CheckCircle2, Scan, Search, Users, Calendar } from 'lucide-react-native';
import { SPACING, SHADOW } from '../theme';
import api from '../api';

const MassVaccinationScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  
  // Data State
  const [vaccines, setVaccines] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedVaccineId, setSelectedVaccineId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('ALL');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextDueDate, setNextDueDate] = useState('');
  const [remark, setRemark] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnimals, setSelectedAnimals] = useState(new Set());

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [vRes, aRes, lRes] = await Promise.all([
        api.get('/vaccines'),
        api.get('/animals'),
        api.get('/locations')
      ]);

      setVaccines(vRes.data.map(v => ({ 
        label: v.name, 
        value: v.id, 
        daysBetween: v.daysBetween,
        dose: v.doseMl,
        route: v.applicationRoute 
      })));
      
      setAnimals(aRes.data);
      
      const locOptions = [{ label: 'All Sheds', value: 'ALL' }];
      lRes.data.forEach(loc => {
        locOptions.push({ label: loc.name, value: loc.id });
      });
      setLocations(locOptions);
      
    } catch (error) {
      console.error('Fetch mass data error:', error);
      Alert.alert('Error', 'Failed to load farm data');
    } finally {
      setLoading(false);
    }
  };

  // Auto-calculate next due date
  useEffect(() => {
    if (selectedVaccineId && date) {
      const selected = vaccines.find(v => v.value === selectedVaccineId);
      if (selected && selected.daysBetween > 0) {
        const baseDate = new Date(date);
        baseDate.setDate(baseDate.getDate() + selected.daysBetween);
        setNextDueDate(baseDate.toISOString().split('T')[0]);
      } else {
        setNextDueDate('');
      }
    }
  }, [selectedVaccineId, date, vaccines]);

  const filteredAnimals = useMemo(() => {
    let result = animals;
    
    // 1. Filter by Location/Shed
    if (selectedLocationId !== 'ALL') {
      result = result.filter(a => a.location_id === selectedLocationId || a.locationId === selectedLocationId);
    }
    
    // 2. Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.tagNumber?.toLowerCase().includes(q) || 
        (a.breeds?.name || '').toLowerCase().includes(q)
      );
    }
    
    return result;
  }, [animals, searchQuery, selectedLocationId]);

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
    if (selectedAnimals.size === filteredAnimals.length) {
      setSelectedAnimals(new Set());
    } else {
      setSelectedAnimals(new Set(filteredAnimals.map(a => a.id)));
    }
  };

  const handleSubmit = async () => {
    if (selectedAnimals.size === 0) {
      Alert.alert('Validation', 'Please select at least one animal');
      return;
    }
    if (!selectedVaccineId) {
      Alert.alert('Validation', 'Please select a vaccine');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/vaccines/records', {
        vaccineId: selectedVaccineId,
        animalIds: Array.from(selectedAnimals),
        date: date,
        nextDueDate: nextDueDate || null,
        remark: remark,
        creationMode: 'MASS'
      });
      Alert.alert('Success', `Recorded vaccination for ${selectedAnimals.size} animals`);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to record mass vaccination');
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
            <Text style={[styles.tagId, { color: theme.colors.text }]}>Tag ID: {item.tagNumber}</Text>
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
  const selectedVaccine = vaccines.find(v => v.value === selectedVaccineId);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GHeader title="Mass Vaccination" onBack={() => navigation.goBack()} leftAlign={true} />

      <ScrollView 
        contentContainerStyle={styles.topContainer} 
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[2]} // Make search bar sticky
      >
        {/* Main Selection Area */}
        <View style={styles.formSection}>
          <GSelect 
            label="Vaccine to Administer*" 
            placeholder="Select from catalog"
            value={selectedVaccineId}
            onSelect={setSelectedVaccineId}
            options={vaccines}
          />
          
          <View style={styles.gridRow}>
            <View style={{ flex: 1 }}>
              <GSelect 
                label="Filter by Shed" 
                value={selectedLocationId}
                onSelect={(id) => {
                  setSelectedLocationId(id);
                  setSelectedAnimals(new Set());
                }}
                options={locations}
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <GDatePicker label="Admin Date" value={date} onDateChange={setDate} />
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={{ flex: 1 }}>
              <GDatePicker label="Booster Due (Optional)" value={nextDueDate} onDateChange={setNextDueDate} placeholder="Set date" />
            </View>
            <View style={{ flex: 1 }} /> 
          </View>
        </View>

        {/* Separator / List Header */}
        <View style={[styles.listHeader, { borderBottomColor: theme.colors.border + '30' }]}>
          <Text style={[styles.listTitle, { color: theme.colors.text }]}>Target Animals</Text>
          <Text style={[styles.listSub, { color: theme.colors.textLight }]}>{filteredAnimals.length} goats available</Text>
        </View>

        {/* Search and Select All Bar */}
        <View style={[styles.searchRow, { backgroundColor: theme.colors.background }]}>
          <View style={styles.searchInner}>
            <GInput 
              placeholder="Search Tag..."
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
            <Text style={[styles.selectAllText, { color: theme.colors.text }]}>All</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
              No animals found matching criteria.
            </Text>
          </View>
        }
      />

      {/* Fixed Footer */}
      <View style={[styles.footer, { paddingBottom: Platform.OS === 'ios' ? 34 : 20 }]}>
        <GInput 
          label="Operational Remark"
          placeholder="e.g. Routine Checkup" 
          value={remark} 
          onChangeText={setRemark}
          containerStyle={{ marginBottom: 12 }}
        />
        <GButton 
          title={selectedAnimals.size > 0 ? `Vaccinate ${selectedAnimals.size} Animals` : 'Select Animals'}
          onPress={handleSubmit}
          loading={submitting}
          disabled={selectedAnimals.size === 0 || !selectedVaccineId}
        />
      </View>
    </SafeAreaView>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  topContainer: {
    padding: SPACING.md,
    paddingBottom: 0,
  },
  formSection: {
    marginBottom: 16,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: -8,
  },
  listHeader: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  listSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  searchRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },
  searchInner: {
    flex: 1,
  },
  selectAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 70,
    justifyContent: 'flex-end',
  },
  selectAllText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  listContent: {
    paddingBottom: 240, 
  },
  animalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
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
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
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
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border + '50',
    ...SHADOW.large,
  },
});

export default MassVaccinationScreen;
