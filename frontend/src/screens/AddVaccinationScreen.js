import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import GHeader from '../components/GHeader';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import GSelect from '../components/GSelect';
import GDatePicker from '../components/GDatePicker';
import { Scan, X, Search, CheckCircle2, Info, Calendar } from 'lucide-react-native';
import api from '../api';
import { useFocusEffect } from '@react-navigation/native';

const AddVaccinationScreen = ({ navigation, route }) => {
  const { theme, isDarkMode } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  
  const existingRecord = route.params?.record;
  const isEditing = !!existingRecord;

  // Form State
  const [date, setDate] = useState(existingRecord?.date ? new Date(existingRecord.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [vaccineId, setVaccineId] = useState(existingRecord?.vaccineId || '');
  const [nextDueDate, setNextDueDate] = useState(existingRecord?.nextDueDate ? new Date(existingRecord.nextDueDate).toISOString().split('T')[0] : '');
  const [remark, setRemark] = useState(existingRecord?.remark || '');
  const [tagNumber, setTagNumber] = useState('');
  const [animal, setAnimal] = useState(existingRecord?.animal || null);
  
  // UI Data
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchVaccines();
    }, [])
  );

  // Auto-calculate next due date
  useEffect(() => {
    if (vaccineId && date) {
      const selected = vaccines.find(v => v.value === vaccineId);
      if (selected && selected.daysBetween > 0) {
        const baseDate = new Date(date);
        baseDate.setDate(baseDate.getDate() + selected.daysBetween);
        setNextDueDate(baseDate.toISOString().split('T')[0]);
      } else {
        setNextDueDate('');
      }
    }
  }, [vaccineId, date, vaccines]);

  const fetchVaccines = async () => {
    try {
      const response = await api.get('/vaccines');
      setVaccines(response.data.map(v => ({ 
        label: v.name, 
        value: v.id, 
        daysBetween: v.daysBetween,
        dose: v.doseMl,
        route: v.applicationRoute
      })));
    } catch (error) {
      console.error('Fetch vaccines error:', error);
    }
  };

  const handleSearchAnimal = async () => {
    if (!tagNumber.trim()) return;
    setSearching(true);
    try {
      const response = await api.get(`/animals/check-tag/${tagNumber.trim()}`);
      setAnimal(response.data);
    } catch (error) {
      Alert.alert('Not Found', 'No animal found with this Tag ID');
      setAnimal(null);
    } finally {
      setSearching(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to remove this vaccination record permanently?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await api.delete(`/vaccines/records/${existingRecord.id}`);
              Alert.alert('Deleted', 'Record has been removed');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete record');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!animal || !vaccineId || !date) {
      Alert.alert('Validation', 'Please select an animal, vaccine, and date');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/vaccines/records/${existingRecord.id}`, {
          date,
          nextDueDate: nextDueDate || null,
          remark
        });
      } else {
        await api.post('/vaccines/records', {
          vaccineId,
          animalIds: [animal.id],
          date,
          nextDueDate: nextDueDate || null,
          remark,
          creationMode: 'SINGLE'
        });
      }
      Alert.alert('Success', isEditing ? 'Record updated successfully' : 'Vaccination recorded successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save record');
    } finally {
      setLoading(false);
    }
  };

  const selectedVaccine = vaccines.find(v => v.value === vaccineId);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GHeader 
        title={isEditing ? "Edit Record" : "Add Vaccination"} 
        onBack={() => navigation.goBack()} 
        leftAlign={true}
      />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textLight }]}>IDENTIFY ANIMAL</Text>
            <View style={styles.inputRow}>
              <View style={{ flex: 1 }}>
                <GInput 
                  label="Scan/Enter Tag ID" 
                  value={tagNumber} 
                  onChangeText={setTagNumber}
                  leftIcon={<Scan size={20} color={theme.colors.textMuted} />}
                  rightIcon={tagNumber ? (
                    <TouchableOpacity onPress={() => {setTagNumber(''); setAnimal(null);}}>
                      <X size={18} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                  ) : null}
                  disabled={isEditing}
                  editable={!isEditing}
                />
              </View>
              {!isEditing && (
                <TouchableOpacity 
                  style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
                  onPress={handleSearchAnimal}
                  disabled={searching}
                >
                  {searching ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.addBtnText}>FIND</Text>}
                </TouchableOpacity>
              )}
            </View>

            {animal && (
              <View style={[styles.animalCard, { backgroundColor: theme.colors.primary + '08', borderColor: theme.colors.primary + '20' }]}>
                <View style={styles.animalCardHeader}>
                  <Text style={[styles.animalTitle, { color: theme.colors.primary }]}>#{animal.tagNumber}</Text>
                  <Text style={[styles.animalBreed, { color: theme.colors.textLight }]}>{animal.breedName}</Text>
                </View>
                <Text style={[styles.animalMeta, { color: theme.colors.textLight }]}>
                  {animal.gender} • {animal.ageInMonths} Months • Current: {animal.currentLocationName}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textLight }]}>ADMINISTRATION DETAILS</Text>
            <GDatePicker 
              label="Vaccination Date*" 
              value={date} 
              onDateChange={setDate}
            />
            
            <GSelect 
              label="Select Vaccine*" 
              value={vaccineId} 
              onSelect={setVaccineId}
              options={vaccines}
              placeholder="Choose from Catalog"
              disabled={isEditing}
            />

            {selectedVaccine && (
              <View style={[styles.infoRow, { borderBottomColor: theme.colors.border + '30' }]}>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textLight }]}>Dose</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>{selectedVaccine.dose || 0} ml</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textLight }]}>Route</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>{selectedVaccine.route || 'N/A'}</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textLight }]}>NEXT APPOINTMENT</Text>
            <GDatePicker 
              label="Next Due Date" 
              value={nextDueDate} 
              onDateChange={setNextDueDate}
              placeholder="Calculated automatically"
              leftIcon={<Calendar size={20} color={theme.colors.primary} />}
            />
            <View style={[styles.tipBox, { backgroundColor: theme.colors.primary + '08' }]}>
              <Info size={16} color={theme.colors.primary} />
              <Text style={[styles.tipText, { color: theme.colors.textLight }]}>
                Setting a due date will trigger a notification {selectedVaccine?.daysBetween || ''} days after this administration.
              </Text>
            </View>
          </View>

          <GInput 
            label="Remarks (Optional)" 
            value={remark} 
            onChangeText={setRemark} 
            placeholder="Condition of animal, lot number, etc."
            multiline
            numberOfLines={3}
          />

          <GButton 
            title={isEditing ? "UPDATE RECORD" : "SAVE VACCINATION"} 
            onPress={handleSave} 
            loading={loading}
            containerStyle={{ marginTop: 12 }}
          />

          {isEditing && (
            <TouchableOpacity 
              style={[styles.deleteBtn, { borderColor: theme.colors.error }]}
              onPress={handleDelete}
              disabled={loading}
            >
              <Text style={[styles.deleteBtnText, { color: theme.colors.error }]}>DELETE RECORD</Text>
            </TouchableOpacity>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: 60,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
    marginBottom: 12,
    paddingLeft: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  addBtn: {
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  animalCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.2,
    borderStyle: 'dashed',
  },
  animalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  animalTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  animalBreed: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  animalMeta: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  tipBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    gap: 10,
    marginTop: 8,
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },
  deleteBtn: {
    marginTop: 16,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  deleteBtnText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
  },
});

export default AddVaccinationScreen;
