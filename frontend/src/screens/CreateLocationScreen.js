import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SPACING, SHADOW } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import GHeader from '../components/GHeader';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import GSelect from '../components/GSelect';
import api from '../api';

const CreateLocationScreen = ({ navigation, route }) => {
  const { isDarkMode, theme } = useTheme();
  const styles = useMemo(() => getStyles(theme, isDarkMode), [theme, isDarkMode]);
  
  const locationToEdit = route?.params?.location;

  const [name, setName] = useState(locationToEdit?.name || locationToEdit?.displayName || '');
  const [parentLocationId, setParentLocationId] = useState(locationToEdit?.parentLocationId || locationToEdit?.parent_location_id || null);
  
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await api.get('/locations');
      const formattedLocs = response.data.map(loc => ({
        label: loc.displayName || loc.name,
        value: loc.id
      }));
      setLocations([{ label: 'None (Top Level)', value: null }, ...formattedLocs]);
    } catch (err) {
      console.error('Error fetching existing locations:', err);
    }
  };

  const handleSave = async () => {
    if (!name) {
      Alert.alert('Validation Error', 'Location Name is required');
      return;
    }

    setLoading(true);
    try {
      if (locationToEdit) {
        // Edit mode
        await api.put(`/locations/${locationToEdit.id}`, {
          name,
          code: locationToEdit.code,
          type: locationToEdit.type,
          parentLocationId
        });
        Alert.alert('Success', 'Physical Location/Shed updated successfully!');
      } else {
        // Create mode
        const generatedCode = name.replace(/\s+/g, '-').substring(0, 6).toUpperCase() + '-' + Math.floor(Math.random() * 1000);
        
        await api.post('/locations', {
          name,
          code: generatedCode,
          type: 'Location',
          parentLocationId
        });
        Alert.alert('Success', 'Physical Location/Shed created successfully!');
      }
      
      setLoading(false);
      navigation.goBack();
    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.message || 'Failed to create location';
      Alert.alert('Error', msg);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GHeader 
        title={locationToEdit ? "Edit Shed" : "Create Shed"} 
        onBack={() => navigation.goBack()} 
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={[styles.sectionInfo, { color: theme.colors.textLight }]}>
              Define the physical pens, sheds, and pastures on your farm so you can assign animals to them later.
            </Text>
            
            <View style={styles.gap} />

            <GInput 
              label="Location Name*" 
              value={name} 
              onChangeText={setName} 
              placeholder="e.g. Maternity Ward B"
              required 
            />
            
            <View style={styles.gap} />
            
            <GSelect 
              label="Parent Location (Optional)" 
              value={parentLocationId} 
              onSelect={setParentLocationId}
              options={locations}
              placeholder="Is this inside another shed?"
            />

          </View>

          <View style={styles.footer}>
            <GButton 
              title={locationToEdit ? "Update Structure" : "Create Structure"} 
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
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    padding: SPACING.lg,
    flexGrow: 1,
    paddingBottom: 40,
  },
  section: {
    marginBottom: SPACING.xl,
    paddingTop: 8,
  },
  sectionInfo: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    lineHeight: 22,
    marginBottom: 8,
  },
  gap: { height: 16 },
  footer: {
    paddingVertical: SPACING.xl,
    marginTop: 'auto',
  }
});

export default CreateLocationScreen;
