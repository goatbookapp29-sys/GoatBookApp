import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import GHeader from '../components/GHeader';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import GSelect from '../components/GSelect';
import api from '../api';

const ProfileSettingsScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    employeeType: ''
  });
  
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/profile');
      const data = response.data;
      
      const mappedData = {
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        employeeType: data.employeeProfile?.employeeType || '',
        // These fields would be in a separate Profile model in a real app
        address: '',
        city: '',
        state: '',
        country: 'India'
      };

      setFormData(mappedData);
      setOriginalData(mappedData);
      setLoading(false);
    } catch (error) {
      console.error('Fetch profile error:', error);
      setLoading(false);
    }
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  const handleReset = () => {
    setFormData(originalData);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/users/profile', {
        name: formData.name,
        email: formData.email
      });
      setOriginalData(formData);
      setSaving(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      setSaving(false);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GHeader title="Profile Settings" onBack={() => navigation.goBack()} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <GInput 
              label="Full Name" 
              value={formData.name} 
              onChangeText={(v) => setFormData({...formData, name: v})} 
              required 
            />
            
            <View style={styles.gap} />
            
            <GInput 
              label="Email Address" 
              value={formData.email} 
              onChangeText={(v) => setFormData({...formData, email: v})} 
              keyboardType="email-address"
            />
            
            <View style={styles.gap} />
            
            <GInput 
              label="Phone Number" 
              value={formData.phone} 
              editable={false} // Phone usually verified/fixed
            />

            <View style={styles.gap} />

            <GInput 
              label="Role" 
              value={formData.employeeType} 
              editable={false}
            />

            <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>Address Details</Text>
            
            <GInput 
              label="Address" 
              value={formData.address} 
              onChangeText={(v) => setFormData({...formData, address: v})} 
            />
            
            <View style={styles.gap} />
            
            <GSelect 
              label="Country" 
              value={formData.country} 
              onSelect={(v) => setFormData({...formData, country: v})}
              options={[
                { label: 'India', value: 'India' },
                { label: 'USA', value: 'USA' },
                { label: 'UK', value: 'UK' }
              ]}
            />
          </View>

          {hasChanges && (
            <View style={styles.buttonRow}>
              <View style={styles.halfBtn}>
                <GButton 
                  title="Reset" 
                  variant="outline" 
                  onPress={handleReset}
                />
              </View>
              <View style={styles.halfBtn}>
                <GButton 
                  title="Save" 
                  onPress={handleSave}
                  loading={saving}
                />
              </View>
            </View>
          )}
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  formContainer: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: SPACING.lg,
  },
  gap: {
    height: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  halfBtn: {
    width: '48%',
  }
});

export default ProfileSettingsScreen;
