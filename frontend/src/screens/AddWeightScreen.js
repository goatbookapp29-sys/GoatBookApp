import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Platform, Alert, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import GHeader from '../components/GHeader';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import GDatePicker from '../components/GDatePicker';
import { Scan, Save, Info } from 'lucide-react-native';
import api from '../api';
import styles from './AddWeightScreen.styles';

const AddWeightScreen = ({ route, navigation }) => {
  const initialTag = route.params?.tagNumber || '';
  const [tagNumber, setTagNumber] = useState(initialTag);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [remark, setRemark] = useState('');
  const [animalInfo, setAnimalInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingAnimal, setFetchingAnimal] = useState(false);

  useEffect(() => {
    if (initialTag) {
      fetchAnimalDetails(initialTag);
    }
  }, [initialTag]);

  const fetchAnimalDetails = async (tag) => {
    if (!tag) return;
    try {
      setFetchingAnimal(true);
      const response = await api.get(`/animals?tagNumber=${tag}`);
      if (response.data && response.data.length > 0) {
        setAnimalInfo(response.data[0]);
      } else {
        setAnimalInfo(null);
      }
    } catch (error) {
      console.error('Fetch animal details error:', error);
      setAnimalInfo(null);
    } finally {
      setFetchingAnimal(false);
    }
  };

  const handleTagChange = (text) => {
    setTagNumber(text);
    if (text.length >= 3) {
      fetchAnimalDetails(text);
    } else {
      setAnimalInfo(null);
    }
  };

  const handleSubmit = async () => {
    if (!tagNumber || !weight) {
      Alert.alert('Required', 'Please enter both Tag ID and Weight');
      return;
    }

    try {
      setLoading(true);
      
      // Explicit validation check to ensure tag exists
      const checkRes = await api.get(`/animals?tagNumber=${tagNumber}`);
      if (!checkRes.data || checkRes.data.length === 0) {
        Alert.alert('Invalid Tag ID', 'The scanned Tag ID does not exist in our system. Please check and try again.');
        setLoading(false);
        return;
      }

      await api.post('/weights', {
        tagNumber,
        weight,
        height,
        date,
        remark
      });
      Alert.alert('Success', 'Weight record added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Add weight error:', error);
      const msg = error.response?.data?.message || 'Failed to add weight record';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <GHeader 
        title="Add Weight" 
        onBack={() => navigation.goBack()} 
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formCard}>
          <View style={styles.row}>
            <View style={styles.flex}>
              <GInput 
                label="Tag ID" 
                value={tagNumber} 
                onChangeText={handleTagChange} 
                placeholder="2912"
                required
                rightIcon={<Scan size={20} color={COLORS.primary} />}
              />
            </View>
          </View>

          {fetchingAnimal && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>Fetching animal details...</Text>
            </View>
          )}

          {animalInfo && (
            <View style={styles.animalDetailCard}>
              <View style={styles.detailRow}>
                <Info size={16} color={COLORS.primary} />
                <Text style={styles.detailLabel}>Breed: </Text>
                <Text style={styles.detailValue}>{animalInfo.Breed?.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Info size={16} color={COLORS.primary} />
                <Text style={styles.detailLabel}>Gender: </Text>
                <Text style={styles.detailValue}>{animalInfo.gender}</Text>
              </View>
            </View>
          )}

          <GDatePicker 
            label="Date" 
            value={date} 
            onDateChange={setDate}
            placeholder="09-09-2025"
            required
          />

          <GInput 
            label="Weight (KG)" 
            value={weight} 
            onChangeText={setWeight} 
            keyboardType="decimal-pad"
            placeholder="55"
            required
          />

          <GInput 
            label="Height" 
            value={height} 
            onChangeText={setHeight} 
            keyboardType="decimal-pad"
            placeholder="5"
          />

          <GInput 
            label="Remark" 
            value={remark} 
            onChangeText={setRemark} 
            placeholder="New!"
            multiline
            numberOfLines={3}
          />
        </View>

        <GButton 
          title="Submit" 
          onPress={handleSubmit} 
          loading={loading}
          containerStyle={styles.submitBtn}
        />
      </ScrollView>
    </View>
  );
};



export default AddWeightScreen;
