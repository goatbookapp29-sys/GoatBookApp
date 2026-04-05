import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import GHeader from '../components/GHeader';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import GSelect from '../components/GSelect';
import api from '../api';
import { useFocusEffect } from '@react-navigation/native';
import { Syringe, Activity, Microscope, Info, ChevronDown } from 'lucide-react-native';

const AddVaccineNameScreen = ({ navigation, route }) => {
  const { theme, isDarkMode } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  
  const editingVaccine = route.params?.vaccine;
  const isEditing = !!editingVaccine;
  
  // Form State
  const [name, setName] = useState(editingVaccine?.name || '');
  const [diseaseName, setDiseaseName] = useState(editingVaccine?.diseaseName || '');
  const [doseMl, setDoseMl] = useState(editingVaccine?.doseMl?.toString() || '');
  const [appRoute, setAppRoute] = useState(editingVaccine?.applicationRoute || 'Sub Cut S/c');
  
  // Calculate frequency based on daysBetween
  const getInitialFrequency = () => {
    if (!editingVaccine?.daysBetween) return { val: '', unit: 'Months' };
    const days = editingVaccine.daysBetween;
    if (days % 365 === 0) return { val: (days / 365).toString(), unit: 'Years' };
    if (days % 30 === 0) return { val: (days / 30).toString(), unit: 'Months' };
    return { val: days.toString(), unit: 'Days' };
  };

  const initialFreq = getInitialFrequency();
  const [frequencyValue, setFrequencyValue] = useState(initialFreq.val);
  const [frequencyUnit, setFrequencyUnit] = useState(initialFreq.unit);
  const [remark, setRemark] = useState(editingVaccine?.remark || '');
  
  const [loading, setLoading] = useState(false);
  const [vaccines, setVaccines] = useState([]);
  const [vaccinesLoading, setVaccinesLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchVaccines();
    }, [])
  );

  const fetchVaccines = async () => {
    try {
      setVaccinesLoading(true);
      const response = await api.get('/vaccines');
      setVaccines(response.data);
      setVaccinesLoading(false);
    } catch (error) {
      console.error('Fetch vaccines error:', error);
      setVaccinesLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Vaccine',
      'Are you sure you want to remove this vaccine from the catalog?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await api.delete(`/vaccines/${editingVaccine.id}`);
              Alert.alert('Deleted', 'Vaccine catalog item removed');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete vaccine');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Vaccine name is required');
      return;
    }

    // Convert frequency to days for backend
    let days = 0;
    const val = parseInt(frequencyValue);
    if (val > 0) {
      if (frequencyUnit === 'Days') days = val;
      else if (frequencyUnit === 'Months') days = val * 30;
      else if (frequencyUnit === 'Years') days = val * 365;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/vaccines/${editingVaccine.id}`, {
          name,
          diseaseName,
          doseMl: doseMl ? parseFloat(doseMl) : null,
          applicationRoute: appRoute,
          daysBetween: days,
          remark
        });
      } else {
        await api.post('/vaccines', {
          name,
          diseaseName,
          doseMl: doseMl ? parseFloat(doseMl) : null,
          applicationRoute: appRoute,
          daysBetween: days,
          remark
        });
      }
      setLoading(false);
      Alert.alert('Success', isEditing ? 'Vaccine updated' : 'Vaccine catalog updated');
      
      if (!isEditing) {
        // Reset Form
        setName('');
        setDiseaseName('');
        setDoseMl('');
        setFrequencyValue('');
        setRemark('');
        fetchVaccines();
      } else {
        navigation.goBack();
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save vaccine');
    }
  };

  const routeOptions = [
    { label: 'Sub Cut S/c (Skin)', value: 'Sub Cut S/c' },
    { label: 'Intra Muscular I/M (Muscle)', value: 'Intra Muscular I/M' },
    { label: 'Oral (Mouth)', value: 'Oral' },
    { label: 'Intranasal (Nose)', value: 'Intranasal' },
  ];

  const unitOptions = [
    { label: 'Days', value: 'Days' },
    { label: 'Months', value: 'Months' },
    { label: 'Years', value: 'Years' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GHeader title={isEditing ? "Edit Vaccine" : "Vaccine Catalog"} onBack={() => navigation.goBack()} leftAlign={true} />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textLight }]}>BASIC INFORMATION</Text>
            <GInput 
              label="Vaccine Name*" 
              value={name} 
              onChangeText={setName} 
              placeholder="e.g. PPR, ET, FMD"
              leftIcon={<Syringe size={20} color={theme.colors.textMuted} />}
              containerStyle={{ marginBottom: 8 }}
            />
            <GInput 
              label="Name of Disease" 
              value={diseaseName} 
              onChangeText={setDiseaseName} 
              placeholder="Target disease"
              leftIcon={<Activity size={20} color={theme.colors.textMuted} />}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textLight }]}>DOSAGE & ROUTE</Text>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <GInput 
                  label="Dose (ml)" 
                  value={doseMl} 
                  onChangeText={setDoseMl} 
                  placeholder="e.g. 1.0"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ width: 16 }} />
              <View style={{ flex: 1.5 }}>
                <GSelect 
                  label="App. Route" 
                  value={appRoute}
                  onSelect={setAppRoute}
                  options={routeOptions}
                  placeholder="Select Route"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textLight }]}>BOOSTER FREQUENCY</Text>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <GInput 
                  label="Given Every" 
                  value={frequencyValue} 
                  onChangeText={setFrequencyValue} 
                  placeholder="0"
                  keyboardType="number-pad"
                />
              </View>
              <View style={{ width: 16 }} />
              <View style={{ flex: 1 }}>
                <GSelect 
                  label="Unit" 
                  value={frequencyUnit}
                  onSelect={setFrequencyUnit}
                  options={unitOptions}
                />
              </View>
            </View>
            <View style={[styles.infoBox, { backgroundColor: theme.colors.primary + '08', borderColor: theme.colors.primary + '20' }]}>
              <Info size={16} color={theme.colors.primary} />
              <Text style={[styles.infoText, { color: theme.colors.textLight }]}>
                Set frequency to <Text style={{ fontWeight: 'bold' }}>0</Text> for one-time vaccinations. This interval helps calculate next due dates automatically.
              </Text>
            </View>
          </View>

          <GInput 
            label="Remark" 
            value={remark} 
            onChangeText={setRemark} 
            placeholder="Additional notes..."
            multiline
            numberOfLines={3}
          />

          <GButton 
            title={isEditing ? "Update Vaccine" : "Save to Catalog"} 
            onPress={handleSave} 
            loading={loading}
            containerStyle={{ marginTop: 12, marginBottom: isEditing ? 12 : 40 }}
          />

          {isEditing && (
            <TouchableOpacity 
              style={[styles.deleteBtn, { borderColor: theme.colors.error }]}
              onPress={handleDelete}
              disabled={loading}
            >
              <Text style={[styles.deleteBtnText, { color: theme.colors.error }]}>DELETE FROM CATALOG</Text>
            </TouchableOpacity>
          )}

          {!isEditing && (
            <>
              {/* Existing Catalog List */}
              <View style={[styles.listHeader, { borderTopColor: theme.colors.border }]}>
                <Text style={[styles.listTitle, { color: theme.colors.text }]}>Vaccine Library</Text>
                <Text style={[styles.listSub, { color: theme.colors.textLight }]}>{vaccines.length} vaccines defined</Text>
              </View>

              {vaccinesLoading ? (
                <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: 20 }} />
              ) : (
                vaccines.map((v) => (
                  <View key={v.id} style={[styles.vaccineCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <View style={[styles.vaccineIndicator, { backgroundColor: theme.colors.primary }]} />
                    <View style={styles.vaccineBody}>
                      <Text style={[styles.vaccineName, { color: theme.colors.text }]}>{v.name}</Text>
                      <Text style={[styles.vaccineMeta, { color: theme.colors.textLight }]}>
                        {v.diseaseName || 'General Health'} • {v.doseMl || 0}ml
                      </Text>
                      <View style={styles.vaccineFooter}>
                        <Text style={[styles.frequencyText, { color: theme.colors.primary }]}>
                          {v.daysBetween > 0 ? `Every ${v.daysBetween} days` : 'One-time'}
                        </Text>
                        <Text style={[styles.routeTag, { color: theme.colors.textLight }]}>{v.applicationRoute}</Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
              <View style={{ height: 40 }} />
            </>
          )}
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
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    gap: 10,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 18,
  },
  listHeader: {
    marginTop: 12,
    paddingTop: 32,
    borderTopWidth: 1,
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  listSub: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  vaccineCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1.2,
    marginBottom: 12,
    overflow: 'hidden',
    ...SHADOW.small,
  },
  vaccineIndicator: {
    width: 6,
  },
  vaccineBody: {
    flex: 1,
    padding: 16,
  },
  vaccineName: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  vaccineMeta: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  vaccineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  frequencyText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  routeTag: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  deleteBtn: {
    marginBottom: 40,
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

export default AddVaccineNameScreen;
