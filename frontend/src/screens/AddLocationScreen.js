import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import GHeader from '../components/GHeader';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import GSelect from '../components/GSelect';
import api from '../api';
import { Scan, HelpCircle } from 'lucide-react-native';
import { SPACING, SHADOW } from '../theme';

const AddLocationScreen = ({ navigation, route }) => {
  const { isDarkMode, theme } = useTheme();
  const styles = useMemo(() => getStyles(theme, isDarkMode), [theme, isDarkMode]);

  const [tagNumber, setTagNumber] = useState('');
  const [animal, setAnimal] = useState(null);
  const [locationId, setLocationId] = useState(null);
  const [newLocationName, setNewLocationName] = useState('');
  const [remark, setRemark] = useState('');
  
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await api.get('/locations');
      setLocations(response.data.map(loc => ({ 
        label: loc.displayName || loc.name, 
        value: loc.id 
      })));
    } catch (error) {
      console.error('Fetch locations error:', error);
    }
  };

  const handleSearchAnimal = async () => {
    if (!tagNumber) {
      Alert.alert('Validation', 'Please enter a Tag ID');
      return;
    }
    setSearching(true);
    try {
      const response = await api.get(`/animals/check-tag/${tagNumber}`);
      setAnimal(response.data);
      setSearching(false);
    } catch (error) {
      setSearching(false);
      setAnimal(null);
      Alert.alert('Not Found', 'Animal with this Tag ID not found in your farm.');
    }
  };

  const handleSave = async () => {
    if (!animal) {
      Alert.alert('Required', 'Please add an animal by searching its Tag ID first.');
      return;
    }

    if (!locationId && !newLocationName) {
      Alert.alert('Required', 'Please select an existing shed or enter a name for a new one.');
      return;
    }

    setLoading(true);
    try {
      let targetLocationId = locationId;

      if (newLocationName) {
        const locRes = await api.post('/locations', {
          name: newLocationName,
          code: newLocationName.toUpperCase().substring(0, 5),
          type: 'Internal Location'
        });
        targetLocationId = locRes.data.id;
      }

      await api.put(`/animals/${animal.id}`, {
        locationId: targetLocationId,
        remark: remark
      });

      setLoading(false);
      Alert.alert('Success', 'Location assigned successfully');
      navigation.goBack();
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || 'Failed to assign location';
      Alert.alert('Error', message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GHeader 
        title="Add Location/Shed" 
        onBack={() => navigation.goBack()} 
        leftAlign={true}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formArea}>
            {/* Tag ID Search Row */}
            <View style={styles.inputRow}>
              <View style={styles.inputFlex}>
                <GInput 
                  label="Scan/Enter Tag ID" 
                  value={tagNumber} 
                  onChangeText={(val) => {
                    setTagNumber(val);
                    if (!val) setAnimal(null);
                  }} 
                  required 
                  leftIcon={<Scan size={20} color={theme.colors.textMuted} />}
                  rightIcon={tagNumber ? (
                    <TouchableOpacity onPress={() => {setTagNumber(''); setAnimal(null);}}>
                      <X size={18} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                  ) : null}
                />
              </View>
              <TouchableOpacity 
                style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
                onPress={handleSearchAnimal}
                activeOpacity={0.8}
                disabled={searching}
              >
                <Text style={styles.addBtnText}>{searching ? '...' : 'ADD'}</Text>
              </TouchableOpacity>
            </View>

            {/* Animal Feedback Card */}
            {animal && (
              <View style={[styles.animalCard, { backgroundColor: theme.colors.primary + '08', borderColor: theme.colors.primary + '20' }]}>
                <View style={styles.animalCardHeader}>
                  <Text style={[styles.animalTitle, { color: theme.colors.primary }]}>
                    #{animal.tagNumber}
                  </Text>
                  <Text style={[styles.animalBreed, { color: theme.colors.textLight }]}>
                    {animal.breedName}
                  </Text>
                </View>
                <Text style={[styles.animalMeta, { color: theme.colors.textLight }]}>
                  {animal.gender} • {animal.ageInMonths} Months • Current: {animal.currentLocationName}
                </Text>
              </View>
            )}
            
            <View style={styles.spacer} />
            
            {/* Location Selectors */}
            <GSelect 
              label="Existing Location/Shed" 
              value={locationId} 
              onSelect={(val) => {
                setLocationId(val);
                if (val) setNewLocationName('');
              }}
              options={locations}
              helpAction={() => {}}
            />
            
            <View style={styles.spacer} />
            
            <GInput 
              label="Add New Location" 
              value={newLocationName} 
              onChangeText={(val) => {
                setNewLocationName(val);
                if (val) setLocationId(null);
              }} 
              helpAction={() => {}}
            />

            <View style={styles.spacer} />

            <GInput 
              label="Remark" 
              value={remark} 
              onChangeText={setRemark} 
              multiline
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Footer */}
      <View style={[styles.footer, { paddingBottom: Platform.OS === 'ios' ? 34 : 20 }]}>
        <GButton 
          title="Submit" 
          onPress={handleSave}
          loading={loading}
          containerStyle={styles.submitBtn}
        />
      </View>
    </View>
  );
};

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  formArea: {
    marginTop: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  inputFlex: {
    flex: 1,
  },
  addBtn: {
    height: 52,
    paddingHorizontal: 24,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4, // Align with GInput wrapper after label handles offset
  },
  addBtnText: {
    color: '#FFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  animalCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 8,
  },
  animalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  animalTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  animalBreed: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  animalMeta: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    opacity: 0.8,
  },
  spacer: {
    height: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingTop: 12,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border + '30',
  },
  submitBtn: {
    height: 56,
    borderRadius: 16,
  }
});

export default AddLocationScreen;
