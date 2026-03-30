import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import GHeader from '../components/GHeader';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import GSelect from '../components/GSelect';
import api from '../api';

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
    if (!tagNumber) return;
    setSearching(true);
    try {
      const response = await api.get(`/animals/check-tag/${tagNumber}`);
      setAnimal(response.data);
      setSearching(false);
    } catch (error) {
      setSearching(false);
      setAnimal(null);
      Alert.alert('Error', 'Animal with this Tag ID not found');
    }
  };

  const handleSave = async () => {
    if (!animal) {
      Alert.alert('Error', 'Please select an animal first');
      return;
    }

    if (!locationId && !newLocationName) {
      Alert.alert('Error', 'Please select a shed or enter a new one');
      return;
    }

    setLoading(true);
    try {
      let targetLocationId = locationId;

      // 1. Create new location if name provided
      if (newLocationName) {
        const locRes = await api.post('/locations', {
          name: newLocationName,
          code: newLocationName.toUpperCase().substring(0, 5),
          type: 'Internal Location'
        });
        targetLocationId = locRes.data.id;
      }

      // 2. Update animal location
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
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <View style={styles.searchRow}>
              <View style={{ flex: 1 }}>
                <GInput 
                  label="Scan/Enter Tag ID*" 
                  value={tagNumber} 
                  onChangeText={setTagNumber} 
                  placeholder="Scan/Enter Tag ID*"
                  required 
                />
              </View>
              <TouchableOpacity 
                style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
                onPress={handleSearchAnimal}
                disabled={searching}
              >
                <Text style={styles.addBtnText}>{searching ? '...' : 'ADD'}</Text>
              </TouchableOpacity>
            </View>

            {animal && (
              <View style={styles.animalInfo}>
                <Text style={styles.animalInfoText}>
                   {(animal.breeds?.name || 'Unknown Breed')} • {animal.gender || ''}
                </Text>
              </View>
            )}
            
            <View style={styles.gap} />
            
            <GSelect 
              label="Existing Location/Shed" 
              value={locationId} 
              onSelect={(val) => {
                setLocationId(val);
                if (val) setNewLocationName(''); // Clear new if existing selected
              }}
              options={locations}
              placeholder="Select Location/Shed"
            />
            
            <View style={styles.gap} />
            
            <GInput 
              label="Add New Location" 
              value={newLocationName} 
              onChangeText={(val) => {
                setNewLocationName(val);
                if (val) setLocationId(null); // Clear existing if new typed
              }} 
              placeholder="Add New Location"
            />

            <View style={styles.gap} />

            <GInput 
              label="Remark" 
              value={remark} 
              onChangeText={setRemark} 
              placeholder="Remark"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.footer}>
            <GButton 
              title="Submit" 
              onPress={handleSave}
              loading={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    flexGrow: 1,
  },
  formContainer: {
    marginTop: SPACING.md,
    backgroundColor: 'transparent',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  addBtn: {
    height: 52,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0, // Align with GInput which has a label
  },
  addBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
  animalInfo: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  animalInfoText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  gap: {
    height: 16,
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: SPACING.xl,
  },
});

export default AddLocationScreen;
