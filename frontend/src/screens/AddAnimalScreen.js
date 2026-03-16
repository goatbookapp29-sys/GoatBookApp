import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../theme';
import GHeader from '../components/GHeader';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import GSelect from '../components/GSelect';
import GDatePicker from '../components/GDatePicker';
import { Check } from 'lucide-react-native';
import api from '../api';
import { getFromCache } from '../utils/cache';

const CheckBox = ({ label, value, onToggle }) => (
  <TouchableOpacity style={styles.checkboxContainer} onPress={onToggle} activeOpacity={0.7}>
    <View style={[styles.checkbox, value && styles.checkboxActive]}>
      {value && <Check size={14} color={COLORS.white} />}
    </View>
    <Text style={styles.checkboxLabel}>{label}</Text>
  </TouchableOpacity>
);

const AddAnimalScreen = ({ navigation, route }) => {
  const isEditing = !!route.params?.animal;
  const existingAnimal = route.params?.animal || {};

  const [tagNumber, setTagNumber] = useState(existingAnimal.tagNumber || '');
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

  // UI state
  const [breeds, setBreeds] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchBreeds();
    fetchLocations();
  }, []);

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
        remark
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
      'Are you sure you want to remove this animal from the farm records?',
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
              navigation.goBack();
            } catch (error) {
              setDeleting(false);
              alert('Failed to delete animal');
            }
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <GHeader 
        title={isEditing ? "Edit Animal" : "Add New Animal"} 
        onBack={() => navigation.goBack()} 
      />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>Identification</Text>

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
                style={{ backgroundColor: '#F3F4F6', color: '#6B7280' }} // Grey out text input feeling
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
              <View style={[styles.row, { paddingVertical: 8, alignItems: 'center' }]}>
                <Text style={styles.maleLabel}>Male Options:</Text>
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

            <GInput 
              label="Remark" 
              value={remark} 
              onChangeText={setRemark} 
              placeholder="e.g. Good!"
              multiline
              style={{ minHeight: 80, paddingTop: 12 }}
            />
          </View>

          <View style={styles.footer}>
            {isEditing ? (
              <View style={styles.buttonRow}>
                <View style={styles.halfBtn}>
                  <GButton 
                    title="Delete" 
                    variant="outline" 
                    onPress={handleDelete}
                    loading={deleting}
                  />
                </View>
                <View style={styles.halfBtn}>
                  <GButton 
                    title="Save" 
                    onPress={handleSave}
                    loading={loading}
                  />
                </View>
              </View>
            ) : (
              <GButton 
                title="Save" 
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    flexGrow: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary, // Orange styling seen in design
    marginBottom: SPACING.md,
  },
  formContainer: {
    marginTop: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  halfWidth: {
    flex: 1,
    marginHorizontal: 4, // 8px gap between (4+4)
  },
  footer: {
    marginTop: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfBtn: {
    width: '48%',
  },
  maleLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
    marginRight: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB', // Tailwind gray-300
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: COLORS.text,
  }
});

export default AddAnimalScreen;
