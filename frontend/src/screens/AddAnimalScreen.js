import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, SPACING } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import styles from './AddAnimalScreen.styles';
import GHeader from '../components/GHeader';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import GSelect from '../components/GSelect';
import GDatePicker from '../components/GDatePicker';
import { Check, HelpCircle, ChevronDown, ChevronUp, Plus, Scale, Syringe } from 'lucide-react-native';
import api from '../api';
import { getFromCache } from '../utils/cache';

const CheckBox = ({ label, value, onToggle }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onToggle} activeOpacity={0.7}>
      <View style={[styles.checkbox, { borderColor: theme.colors.border }, value && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}>
        {value && <Check size={14} color="white" />}
      </View>
      <Text style={[styles.checkboxLabel, { color: theme.colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const AddAnimalScreen = ({ navigation, route }) => {
  const { isDarkMode, theme } = useTheme();
  const isEditing = !!route.params?.animal;
  const existingAnimal = route.params?.animal || {};
  const [weightExpanded, setWeightExpanded] = useState(false);

  const [tagNumber, setTagNumber] = useState(existingAnimal.tagNumber || '');
  const [weights, setWeights] = useState([]);
  const [weightsLoading, setWeightsLoading] = useState(false);
  const [vaccinations, setVaccinations] = useState([]);
  const [vaccinationsLoading, setVaccinationsLoading] = useState(false);
  const [vaccinationExpanded, setVaccinationExpanded] = useState(false);
  const [breedId, setBreedId] = useState(existingAnimal.breedId || '');
  const [color, setColor] = useState(existingAnimal.color || '');
  const [gender, setGender] = useState(existingAnimal.gender || 'FEMALE');
  const [batchNo, setBatchNo] = useState(existingAnimal.batchNo || '');
  const [acquisitionMethod, setAcquisitionMethod] = useState(existingAnimal.acquisitionMethod || 'BORN');
  const [locationId, setLocationId] = useState(existingAnimal.locationId || null);
  
  // Age and Parents
  const [birthDate, setBirthDate] = useState(existingAnimal.birthDate || '');
  const [birthWeight, setBirthWeight] = useState(existingAnimal.birthWeight?.toString() || '');
  const [ageInMonths, setAgeInMonths] = useState(existingAnimal.ageInMonths?.toString() || '');
  const [birthType, setBirthType] = useState(existingAnimal.birthType || 'SINGLE');
  const [motherTagId, setMotherTagId] = useState(existingAnimal.motherTagId || '');
  const [fatherTagId, setFatherTagId] = useState(existingAnimal.fatherTagId || '');
  
  // Male specific
  const [isBreeder, setIsBreeder] = useState(existingAnimal.isBreeder || false);
  const [isQurbani, setIsQurbani] = useState(existingAnimal.isQurbani || false);

  // Purchased specific
  const [purchaseDate, setPurchaseDate] = useState(existingAnimal.purchaseDate || '');
  const [purchasePrice, setPurchasePrice] = useState(existingAnimal.purchasePrice?.toString() || '');
  const [femaleCondition, setFemaleCondition] = useState(existingAnimal.femaleCondition || 'NONE');

  // Misc
  const [remark, setRemark] = useState(existingAnimal.remark || '');
  const [animalStatus, setAnimalStatus] = useState(existingAnimal.status || 'LIVE');
  const [isReadyForSale, setIsReadyForSale] = useState(existingAnimal.isReadyForSale || false);
  const [currentWeight, setCurrentWeight] = useState(existingAnimal.currentWeight?.toString() || '');
  const [salePrice, setSalePrice] = useState(existingAnimal.salePrice?.toString() || '');

  // UI state
  const [breeds, setBreeds] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchBreeds();
      fetchLocations();
      if (isEditing) {
        fetchWeights();
        fetchVaccinations();
      }
    }, [])
  );

  const fetchVaccinations = async () => {
    try {
      setVaccinationsLoading(true);
      const response = await api.get(`/vaccines/records?animalId=${existingAnimal.id}`);
      setVaccinations(response.data);
    } catch (error) {
      console.error('Fetch vaccinations error:', error);
    } finally {
      setVaccinationsLoading(false);
    }
  };

  const fetchWeights = async () => {
    try {
      setWeightsLoading(true);
      const response = await api.get(`/weights?animalId=${existingAnimal.id}`);
      setWeights(response.data);
    } catch (error) {
      console.error('Fetch weights error:', error);
    } finally {
      setWeightsLoading(false);
    }
  };

  // Rules: Uncheck male specific boxes if gender changes to FEMALE
  useEffect(() => {
    if (gender === 'FEMALE') {
      setIsBreeder(false);
      setIsQurbani(false);
    }
  }, [gender]);

  // Rules: Reset specific fields when method changes
  useEffect(() => {
    if (acquisitionMethod === 'BORN') {
      setPurchaseDate('');
      setPurchasePrice('');
      setFemaleCondition('NONE');
    } else {
      setMotherTagId('');
      setFatherTagId('');
    }
  }, [acquisitionMethod]);

  // Calculate age when birth date changes
  useEffect(() => {
    if (birthDate) {
      const birth = new Date(birthDate);
      const now = new Date();
      let months = (now.getFullYear() - birth.getFullYear()) * 12;
      months -= birth.getMonth();
      months += now.getMonth();
      if (months < 0) months = 0;
      setAgeInMonths(months.toString());
    }
  }, [birthDate]);

  const fetchBreeds = async () => {
    try {
      const response = await api.get('/breeds');
      setBreeds(response.data.map(b => ({ label: `${b.name} (${b.animalType})`, value: b.id, animalType: b.animalType })));
    } catch (error) {
      console.warn('Fetch breeds failed, trying cache...', error);
      const cached = await getFromCache('breeds');
      if (cached) {
        setBreeds(cached.map(b => ({ label: `${b.name} (${b.animalType})`, value: b.id, animalType: b.animalType })));
      }
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await api.get('/locations');
      const transformed = response.data.map(loc => ({ 
        label: loc.displayName || loc.name, 
        value: loc.id 
      }));
      setLocations([{ label: 'No Location Assigned', value: null }, ...transformed]);
    } catch (error) {
      console.warn('Fetch locations failed, trying cache...', error);
      const cached = await getFromCache('locations');
      if (cached) {
        const transformed = cached.map(loc => ({ 
          label: loc.displayName || loc.name, 
          value: loc.id 
        }));
        setLocations([{ label: 'No Location Assigned', value: null }, ...transformed]);
      }
    }
  };

  const toggleBreeder = () => {
    if (gender !== 'MALE') return;
    setIsBreeder(prev => {
      if (!prev) setIsQurbani(false);
      return !prev;
    });
  };

  const toggleQurbani = () => {
    if (gender !== 'MALE') return;
    setIsQurbani(prev => {
      if (!prev) setIsBreeder(false);
      return !prev;
    });
  };

  const handleSave = async () => {
    if (!tagNumber || !breedId || !gender || !acquisitionMethod) {
      alert('Please fill in all required fields marked with *');
      return;
    }

    if (acquisitionMethod === 'PURCHASED') {
      if (!purchaseDate || !purchasePrice || !ageInMonths) {
        alert('Purchase date, price, and age in months are required for purchased animals.');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = { 
        tagNumber, 
        breedId, 
        gender, 
        color,
        batchNo,
        acquisitionMethod,
        locationId,
        birthDate: birthDate || null,
        birthWeight: birthWeight ? parseFloat(birthWeight) : null,
        ageInMonths: ageInMonths ? parseInt(ageInMonths) : null,
        birthType: birthType || null,
        motherTagId: acquisitionMethod === 'BORN' ? (motherTagId || null) : null,
        fatherTagId: acquisitionMethod === 'BORN' ? (fatherTagId || null) : null,
        isBreeder: gender === 'MALE' ? isBreeder : false,
        isQurbani: gender === 'MALE' ? isQurbani : false,
        purchaseDate: acquisitionMethod === 'PURCHASED' ? purchaseDate : null,
        purchasePrice: acquisitionMethod === 'PURCHASED' ? purchasePrice : null,
        femaleCondition: (gender === 'FEMALE' && acquisitionMethod === 'PURCHASED') ? femaleCondition : null,
        remark,
        status: animalStatus,
        isReadyForSale,
        currentWeight: isReadyForSale ? (parseFloat(currentWeight) || null) : null,
        salePrice: isReadyForSale ? (parseFloat(salePrice) || null) : null,
      };

      if (isEditing) {
        await api.put(`/animals/${existingAnimal.id}`, payload);
      } else {
        await api.post('/animals', payload);
      }
      setLoading(false);
      navigation.goBack();
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || 'Failed to save animal';
      alert(message);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Animal',
      'Are you sure you want to delete this animal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            setDeleting(true);
            try {
              await api.delete(`/animals/${existingAnimal.id}`);
              setDeleting(false);
              navigation.navigate('AnimalList');
            } catch (error) {
              setDeleting(false);
              const msg = error.response?.data?.message || 'Failed to delete animal';
              alert(msg);
            }
          } 
        }
      ]
    );
  };

  const sectionHeaderStyle = [styles.sectionTitle, { color: theme.colors.primary, borderLeftWidth: 4, borderLeftColor: theme.colors.primary, paddingLeft: 10, marginTop: 10 }];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GHeader 
        title={isEditing ? "Edit Animal" : "Add New Animal"} 
        onBack={() => navigation.goBack()} 
      />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={sectionHeaderStyle}>Identification</Text>

          <View style={styles.formContainer}>
            {/* ROW 1 */}
            <View style={styles.row}>
              <GInput 
                containerStyle={styles.halfWidth}
                label="Tag ID" 
                value={tagNumber} 
                onChangeText={setTagNumber} 
                placeholder="2912"
                required 
              />
              <GInput 
                containerStyle={styles.halfWidth}
                label="Animal Type" 
                value={breedId ? breeds.find(b => b.value === breedId)?.animalType || 'Goat' : 'Goat'} 
                editable={false}
                style={{ backgroundColor: theme.colors.surface, color: theme.colors.textMuted }}
              />
            </View>

            {/* ROW 2 */}
            <View style={styles.row}>
              <GSelect 
                containerStyle={styles.halfWidth}
                label="Breed" 
                value={breedId} 
                onSelect={setBreedId}
                options={breeds}
                placeholder="Select..."
                required
              />
              <GSelect 
                containerStyle={styles.halfWidth}
                label="Gender" 
                value={gender} 
                onSelect={setGender}
                options={[
                  { label: 'Male', value: 'MALE' },
                  { label: 'Female', value: 'FEMALE' }
                ]}
                required
              />
            </View>

            {/* MALE CONDITIONAL ROW */}
            {gender === 'MALE' && (
              <View style={[styles.row, { paddingVertical: 12, alignItems: 'center' }]}>
                <Text style={[styles.maleLabel, { color: theme.colors.text }]}>Male Options:</Text>
                <CheckBox label="Breeder" value={isBreeder} onToggle={toggleBreeder} />
                <View style={{ width: 16 }} />
                <CheckBox label="Qurbani" value={isQurbani} onToggle={toggleQurbani} />
              </View>
            )}

            {/* ROW 3 */}
            <View style={styles.row}>
               <GInput 
                containerStyle={styles.halfWidth}
                label="Color" 
                value={color}
                onChangeText={setColor}
                placeholder="e.g. Red"
              />
              <GInput 
                containerStyle={styles.halfWidth}
                label="Batch / Group No" 
                value={batchNo} 
                onChangeText={setBatchNo} 
                placeholder="e.g. 31"
              />
            </View>

            {/* ROW 4 */}
            <View style={styles.row}>
              <GSelect 
                containerStyle={styles.halfWidth}
                label="By Purchase/Birth" 
                value={acquisitionMethod} 
                onSelect={setAcquisitionMethod}
                options={[
                  { label: 'Born At Farm', value: 'BORN' },
                  { label: 'Purchased', value: 'PURCHASED' }
                ]}
                required
              />
              <GSelect 
                containerStyle={styles.halfWidth}
                label="Location/Shed" 
                value={locationId} 
                onSelect={setLocationId}
                options={locations}
                placeholder="Select..."
              />
            </View>

            <Text style={sectionHeaderStyle}>Growth & Background</Text>

            {/* UNIVERSAL ROW: Birth Date and Birth Wt */}
            <View style={styles.row}>
              <GDatePicker 
                containerStyle={styles.halfWidth}
                label="Birth Date" 
                value={birthDate} 
                onDateChange={setBirthDate}
                placeholder="09-09-2025"
              />
              <GInput 
                containerStyle={styles.halfWidth}
                label="Birth Wt.(KG)" 
                value={birthWeight} 
                onChangeText={setBirthWeight} 
                keyboardType="decimal-pad"
                placeholder="e.g. 5.5"
              />
            </View>

            {/* UNIVERSAL ROW: Age and Birth Type */}
            <View style={styles.row}>
              <GInput 
                containerStyle={styles.halfWidth}
                label="Age(In Months)" 
                value={ageInMonths} 
                onChangeText={setAgeInMonths} 
                keyboardType="number-pad"
                placeholder="e.g. 12"
                required={acquisitionMethod === 'PURCHASED'}
              />
              <GSelect 
                containerStyle={styles.halfWidth}
                label="Birth Type" 
                value={birthType} 
                onSelect={setBirthType}
                options={[
                  { label: 'Single', value: 'SINGLE' },
                  { label: 'Twin', value: 'TWIN' },
                  { label: 'Triplet', value: 'TRIPLET' },
                  { label: 'Quadruplet', value: 'QUADRUPLET' }
                ]}
              />
            </View>

            {/* CONDITIONAL SECTIONS BASED ON ACQUISITION METHOD */}
            {acquisitionMethod === 'PURCHASED' ? (
              <>
                <View style={styles.row}>
                  <GDatePicker 
                    containerStyle={styles.halfWidth}
                    label="Purchase Date" 
                    value={purchaseDate} 
                    onDateChange={setPurchaseDate}
                    placeholder="09-09-2025"
                    required
                  />
                  <GInput 
                    containerStyle={styles.halfWidth}
                    label="Purchase Price" 
                    value={purchasePrice} 
                    onChangeText={setPurchasePrice} 
                    keyboardType="number-pad"
                    placeholder="e.g. 5000"
                    required
                  />
                </View>
                {gender === 'FEMALE' && (
                  <View style={styles.row}>
                    <GSelect 
                      containerStyle={styles.halfWidth}
                      label="Female Cond." 
                      value={femaleCondition} 
                      onSelect={setFemaleCondition}
                      options={[
                        { label: 'None', value: 'NONE' },
                        { label: 'Mated', value: 'MATED' },
                        { label: 'Pregnant', value: 'PREGNANT' }
                      ]}
                    />
                    <View style={styles.halfWidth} />
                  </View>
                )}
              </>
            ) : (
              // BORN SPECIFIC: MOTHER & FATHER
              <View style={styles.row}>
                <GInput 
                  containerStyle={styles.halfWidth}
                  label="Mother Tag ID" 
                  value={motherTagId}
                  onChangeText={setMotherTagId}
                  placeholder="e.g. 1974"
                />
                <GInput 
                  containerStyle={styles.halfWidth}
                  label="Father Tag ID" 
                  value={fatherTagId}
                  onChangeText={setFatherTagId}
                  placeholder="e.g. 1974"
                />
              </View>
            )}

            <View style={[styles.sectionDivider, { backgroundColor: theme.colors.border }]} />

            <View style={{ marginBottom: 16 }}>
              <GSelect 
                label="Animal Status" 
                value={animalStatus} 
                onSelect={setAnimalStatus}
                options={[
                  { label: 'Live', value: 'LIVE' },
                  { label: 'Sold', value: 'SOLD' },
                  { label: 'Dead', value: 'DEAD' }
                ]}
              />
            </View>

            <View style={styles.readyForSaleRow}>
              <Text style={[styles.readyLabel, { color: theme.colors.primary }]}>Ready for Sale?</Text>
              <CheckBox label={isReadyForSale ? 'Yes' : 'No'} value={isReadyForSale} onToggle={() => setIsReadyForSale(!isReadyForSale)} />
            </View>

            {isReadyForSale && (
              <View style={[styles.row, { marginTop: 12 }]}>
                <GInput 
                  containerStyle={styles.halfWidth}
                  label="Current Weight (KG)" 
                  value={currentWeight} 
                  onChangeText={setCurrentWeight} 
                  keyboardType="decimal-pad"
                  placeholder="e.g. 25.5"
                  required
                />
                <GInput 
                  containerStyle={styles.halfWidth}
                  label="Sale Price" 
                  value={salePrice} 
                  onChangeText={setSalePrice} 
                  keyboardType="number-pad"
                  placeholder="e.g. 15000"
                  required
                />
              </View>
            )}

            <View style={[styles.sectionDivider, { backgroundColor: theme.colors.border }]} />

            <GInput 
              label="Remark" 
              value={remark} 
              onChangeText={setRemark} 
              placeholder="e.g. Good!"
              multiline
              style={{ minHeight: 80, paddingTop: 12, color: theme.colors.text }}
            />
          </View>

          {isEditing && (
            <View style={[styles.weightSection, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <TouchableOpacity 
                style={[styles.weightHeader, { borderBottomColor: theme.colors.border }]}
                activeOpacity={0.7}
                onPress={() => setWeightExpanded(!weightExpanded)}
              >
                <View style={[styles.row, { marginBottom: 0, alignItems: 'center' }]}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.primary, marginBottom: 0 }]}>Weight Records</Text>
                  <Scale size={16} color={theme.colors.textMuted} style={{ marginLeft: 8 }} />
                </View>
                {weightExpanded ? <ChevronUp size={20} color={theme.colors.textMuted} /> : <ChevronDown size={20} color={theme.colors.textMuted} />}
              </TouchableOpacity>
              
              {weightExpanded && (
                <View style={styles.weightContent}>
                  <TouchableOpacity 
                    style={[styles.addNewBtn, { backgroundColor: theme.colors.secondary }]}
                    onPress={() => navigation.navigate('AddWeight', { tagNumber: existingAnimal.tagNumber })}
                  >
                    <Plus size={16} color="white" />
                    <Text style={styles.addNewText}>Add Record</Text>
                  </TouchableOpacity>

                  {weightsLoading ? (
                    <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} />
                  ) : weights.length > 0 ? (
                    <View style={styles.weightList}>
                      {weights.map((w, idx) => (
                        <View key={w.id} style={[styles.weightItem, { borderBottomColor: theme.colors.border }, idx === weights.length - 1 && { borderBottomWidth: 0 }]}>
                          <View style={[styles.weightIconBox, { backgroundColor: isDarkMode ? theme.colors.surface : '#FFF1EA' }]}>
                            <Scale size={16} color={theme.colors.primary} />
                          </View>
                          <View style={styles.weightInfoBlock}>
                            <Text style={[styles.weightKg, { color: theme.colors.text }]}>{w.weight} KG</Text>
                            <Text style={[styles.weightDate, { color: theme.colors.textLight }]}>{w.date}</Text>
                          </View>
                          {w.height && (
                            <View style={styles.heightInfoBlock}>
                              <Text style={[styles.weightLabel, { color: theme.colors.textLight }]}>Height</Text>
                              <Text style={[styles.weightValue, { color: theme.colors.text }]}>{w.height}</Text>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={[styles.noRecordsText, { color: theme.colors.textMuted }]}>No records found</Text>
                  )}
                </View>
              )}
            </View>
          )}

          {isEditing && (
            <View style={[styles.weightSection, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <TouchableOpacity 
                style={[styles.weightHeader, { borderBottomColor: theme.colors.border }]}
                activeOpacity={0.7}
                onPress={() => setVaccinationExpanded(!vaccinationExpanded)}
              >
                <View style={[styles.row, { marginBottom: 0, alignItems: 'center' }]}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.primary, marginBottom: 0 }]}>Vaccinations</Text>
                  <Syringe size={16} color={theme.colors.textMuted} style={{ marginLeft: 8 }} />
                </View>
                {vaccinationExpanded ? <ChevronUp size={20} color={theme.colors.textMuted} /> : <ChevronDown size={20} color={theme.colors.textMuted} />}
              </TouchableOpacity>
              
              {vaccinationExpanded && (
                <View style={styles.weightContent}>
                  <TouchableOpacity 
                    style={[styles.addNewBtn, { backgroundColor: theme.colors.secondary }]}
                    onPress={() => navigation.navigate('AddVaccination', { mode: 'single', preSelectedAnimal: existingAnimal })}
                  >
                    <Plus size={16} color="white" />
                    <Text style={styles.addNewText}>Add Record</Text>
                  </TouchableOpacity>

                  {vaccinationsLoading ? (
                    <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} />
                  ) : vaccinations.length > 0 ? (
                    <View style={styles.weightList}>
                      {vaccinations.map((v, idx) => (
                        <TouchableOpacity 
                          key={v.id} 
                          style={[styles.weightItem, { borderBottomColor: theme.colors.border }, idx === vaccinations.length - 1 && { borderBottomWidth: 0 }]}
                          onPress={() => navigation.navigate('AddVaccination', { mode: 'single', record: v })}
                        >
                          <View style={[styles.weightIconBox, { backgroundColor: isDarkMode ? theme.colors.surface : '#F0F9FF' }]}>
                            <Syringe size={16} color={theme.colors.primary} />
                          </View>
                          <View style={styles.weightInfoBlock}>
                            <Text style={[styles.weightKg, { color: theme.colors.text }]}>{v.vaccine?.name}</Text>
                            <Text style={[styles.weightDate, { color: theme.colors.textLight }]}>{v.date}</Text>
                          </View>
                          {v.nextDueDate && (
                            <View style={[styles.heightInfoBlock, { minWidth: 100 }]}>
                              <Text style={[styles.weightLabel, { color: theme.colors.primary }]}>Due Date</Text>
                              <Text style={[styles.weightValue, { color: theme.colors.text }]}>{v.nextDueDate}</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <Text style={[styles.noRecordsText, { color: theme.colors.textMuted }]}>No records found</Text>
                  )}
                </View>
              )}
            </View>
          )}

          <View style={styles.footer}>
            {isEditing ? (
              <View style={styles.buttonRow}>
                <View style={[styles.halfBtn, { marginRight: 8 }]}>
                  <GButton 
                    title="Delete" 
                    variant="outline" 
                    onPress={handleDelete}
                    loading={deleting}
                  />
                </View>
                <View style={styles.halfBtn}>
                  <GButton 
                    title="Save Changes" 
                    onPress={handleSave}
                    loading={loading}
                  />
                </View>
              </View>
            ) : (
              <GButton 
                title="Create Animal Record" 
                onPress={handleSave}
                loading={loading}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};



export default AddAnimalScreen;
