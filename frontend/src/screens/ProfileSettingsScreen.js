import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { COLORS, SPACING } from '../theme';
import GHeader from '../components/GHeader';
import GInput from '../components/GInput';
import GSelect from '../components/GSelect';
import GButton from '../components/GButton';
import api from '../api';

const ProfileSettingsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Data Options
  const employeeTypes = [
    { label: 'Owner', value: 'Owner' },
    { label: 'Manager', value: 'Manager' },
    { label: 'Worker', value: 'Worker' },
    { label: 'Administrative', value: 'Administrative' }
  ];

  const countries = [
    { label: 'India', value: 'India' },
    { label: 'United States', value: 'USA' },
    { label: 'United Kingdom', value: 'UK' }
  ];

  const states = [
    { label: 'Madhya Pradesh', value: 'Madhya Pradesh' },
    { label: 'Maharashtra', value: 'Maharashtra' },
    { label: 'Rajasthan', value: 'Rajasthan' },
    { label: 'Uttar Pradesh', value: 'Uttar Pradesh' }
  ];

  const cities = [
    { label: 'Indore', value: 'Indore' },
    { label: 'Bhopal', value: 'Bhopal' },
    { label: 'Mumbai', value: 'Mumbai' },
    { label: 'Pune', value: 'Pune' }
  ];

  // Form values
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    employeeType: 'Owner',
    companyName: '',
    address: '',
    city: 'Indore',
    state: 'Madhya Pradesh',
    country: 'India',
  });

  // Original data for comparison
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/profile');
      const data = response.data;
      
      const mappedData = {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phoneNumber || '',
        employeeType: data.role === 'user' ? 'Owner' : data.role,
        companyName: '',
        address: data.address || '',
        city: data.city || 'Indore',
        state: 'Madhya Pradesh',
        country: 'India',
      };
      
      setFormData(mappedData);
      setOriginalData(mappedData);
      setLoading(false);
    } catch (error) {
      console.error('Fetch profile error:', error);
      setLoading(false);
      alert('Failed to load profile data');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFormData(originalData);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/users/profile', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phone,
        bio: '',
        address: formData.address,
        city: formData.city,
      });
      
      setOriginalData(formData);
      setSaving(false);
      alert('Profile updated successfully!');
    } catch (error) {
      setSaving(false);
      alert('Failed to update profile');
    }
  };

  const hasChanges = Object.keys(formData).some(
    key => formData[key] !== originalData[key]
  );

  return (
    <View style={styles.container}>
      <GHeader title="Profile Settings" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Fetching profile...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <GInput 
                  label="First Name" 
                  value={formData.firstName} 
                  onChangeText={(val) => handleInputChange('firstName', val)} 
                  required 
                />
              </View>
              <View style={styles.halfWidth}>
                <GInput 
                  label="Last Name" 
                  value={formData.lastName} 
                  onChangeText={(val) => handleInputChange('lastName', val)} 
                  required 
                />
              </View>
            </View>

            <GInput 
              label="Email" 
              value={formData.email} 
              onChangeText={(val) => handleInputChange('email', val)} 
              required 
              keyboardType="email-address"
              editable={false}
            />

            <GInput 
              label="Phone" 
              value={formData.phone} 
              onChangeText={(val) => handleInputChange('phone', val)} 
              required 
              keyboardType="phone-pad"
            />

            <GSelect 
              label="Employee Type" 
              value={formData.employeeType} 
              options={employeeTypes}
              onSelect={(val) => handleInputChange('employeeType', val)} 
              required 
            />

            <GInput 
              label="Company Name(Optional)" 
              value={formData.companyName} 
              onChangeText={(val) => handleInputChange('companyName', val)} 
            />

            <GInput 
              label="Address" 
              value={formData.address} 
              onChangeText={(val) => handleInputChange('address', val)} 
              multiline
            />

            <GSelect 
              label="Country" 
              value={formData.country} 
              options={countries}
              onSelect={(val) => handleInputChange('country', val)} 
            />

            <GSelect 
              label="State" 
              value={formData.state} 
              options={states}
              onSelect={(val) => handleInputChange('state', val)} 
            />

            <GSelect 
              label="City" 
              value={formData.city} 
              options={cities}
              onSelect={(val) => handleInputChange('city', val)} 
            />

            {hasChanges && (
              <View style={styles.buttonContainer}>
                <View style={styles.halfWidth}>
                  <GButton 
                    title="Reset" 
                    onPress={handleReset} 
                    variant="outline"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <GButton 
                    title="Save" 
                    onPress={handleSave} 
                    loading={saving}
                  />
                </View>
              </View>
            )}
          </ScrollView>
        )}
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
    paddingBottom: SPACING.xxl,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textLight,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  halfWidth: {
    width: '48%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
    width: '100%',
  },
});

export default ProfileSettingsScreen;
