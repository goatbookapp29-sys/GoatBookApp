import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { COLORS } from '../theme';
import GHeader from '../components/GHeader';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import { ShieldAlert } from 'lucide-react-native';
import api from '../api';
import styles from './FarmSettingsScreen.styles';

const FarmSettingsScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchFarmDetails();
  }, []);

  const fetchFarmDetails = async () => {
    try {
      setFetching(true);
      const response = await api.get('/farms/current');
      setName(response.data.name);
      setLocation(response.data.location || '');
      
      // Get role from profile
      const profileResponse = await api.get('/users/profile');
      const role = profileResponse.data?.employeeProfile?.employeeType;
      
      setIsOwner(role === 'OWNER');
    } catch (error) {
      console.error('Fetch farm error:', error);
      Alert.alert('Error', 'Failed to load farm details');
    } finally {
      setFetching(false);
    }
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Farm name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      await api.put('/farms/current', { name, location });
      Alert.alert('Success', 'Farm details updated successfully');
    } catch (error) {
      console.error('Update farm error:', error);
      const msg = error.response?.data?.message || 'Failed to update farm details';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GHeader title="Farm Settings" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {!isOwner && (
          <View style={styles.infoBox}>
            <ShieldAlert size={20} color="#B45309" />
            <Text style={styles.infoText}>
              Only farm owners can modify these settings. Your changes will not be saved if you are not an owner.
            </Text>
          </View>
        )}

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Details</Text>
          
          <GInput 
            label="Farm Name" 
            value={name} 
            onChangeText={setName} 
            placeholder="Goat Farm Alpha"
            required
            editable={isOwner}
          />

          <GInput 
            label="Location" 
            value={location} 
            onChangeText={setLocation} 
            placeholder="City, State"
            multiline
            numberOfLines={2}
            editable={isOwner}
          />
        </View>

        {isOwner && (
          <GButton 
            title="Save Changes" 
            onPress={handleUpdate} 
            loading={loading}
            containerStyle={styles.submitBtn}
          />
        )}
      </ScrollView>
    </View>
  );
};

export default FarmSettingsScreen;
