import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, SafeAreaView } from 'react-native';
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
      const formattedLocs = response.data
        .filter(loc => !locationToEdit || loc.id !== locationToEdit.id) // Prevent self-parenting
        .map(loc => ({
          label: loc.displayName || loc.name,
          value: loc.id
        }));
      setLocations([{ label: 'None (Top Level)', value: null }, ...formattedLocs]);
    } catch (err) {
      console.error('Error fetching existing locations:', err);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Location Name is required');
      return;
    }

    setLoading(true);
    try {
      if (locationToEdit) {
        await api.put(`/locations/${locationToEdit.id}`, {
          name,
          code: locationToEdit.code,
          type: locationToEdit.type,
          parentLocationId
        });
        Alert.alert('Success', 'Physical Location/Shed updated successfully!');
      } else {
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
            <Text style={[styles.infoText, { color: theme.colors.textLight }]}>
              Define the physical pens, sheds, and pastures on your farm so you can organize your livestock efficiently.
            </Text>
            
            <View style={styles.spacer} />

            <GInput 
              label="Location Name" 
              value={name} 
              onChangeText={setName} 
              placeholder="e.g. Maternity Ward B"
              required 
            />
            
            <View style={styles.spacer} />
            
            <GSelect 
              label="Parent Location (Optional)" 
              value={parentLocationId} 
              onSelect={setParentLocationId}
              options={locations}
              helpAction={() => {}}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: Platform.OS === 'ios' ? 34 : 20 }]}>
        <GButton 
          title={locationToEdit ? "Update Shed" : "Create Shed"} 
          onPress={handleSave}
          loading={loading}
          containerStyle={styles.submitBtn}
        />
      </View>
    </View>
  );
};

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  formArea: {
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    lineHeight: 22,
    opacity: 0.8,
  },
  spacer: { height: 24 },
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

export default CreateLocationScreen;
