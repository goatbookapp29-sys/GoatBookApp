import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { COLORS, SPACING } from '../theme';
import GHeader from '../components/GHeader';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import api from '../api';

const AddVaccineNameScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [daysBetween, setDaysBetween] = useState('');
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Vaccine name is required');
      return;
    }

    setLoading(true);
    try {
      await api.post('/vaccines', {
        name,
        daysBetween: daysBetween ? parseInt(daysBetween) : 0,
        remark
      });
      setLoading(false);
      Alert.alert('Success', 'Vaccine name added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.message || 'Failed to save vaccine';
      Alert.alert('Error', msg);
    }
  };

  return (
    <View style={styles.container}>
      <GHeader title="Add Vaccine" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.formCard}>
            <GInput 
              label="Vaccine Name*" 
              value={name} 
              onChangeText={setName} 
              placeholder="Enter name"
              required 
            />
            
            <View style={styles.daysRow}>
              <Text style={styles.daysLabel}>Given Every*</Text>
              <GInput 
                containerStyle={styles.daysInputBox}
                value={daysBetween} 
                onChangeText={setDaysBetween} 
                placeholder="0"
                keyboardType="number-pad"
              />
              <Text style={styles.daysSuffix}>Days</Text>
            </View>

            <Text style={styles.helperText}>
              Given number of days help to find next due date for vaccination. Enter correct days for vaccine to get alert on due date. Enter zero for one time vaccination.
            </Text>

            <GInput 
              label="Remark" 
              value={remark} 
              onChangeText={setRemark} 
              placeholder="Optional"
              multiline
              style={{ minHeight: 80, paddingTop: 12 }}
            />
          </View>

          <View style={styles.footer}>
            <GButton 
              title="SAVE" 
              onPress={handleSave} 
              loading={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: SPACING.lg,
  },
  formCard: {
    paddingBottom: SPACING.xl,
  },
  daysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  daysLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    marginRight: 10,
  },
  daysInputBox: {
    width: 80,
    marginBottom: 0,
  },
  daysSuffix: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 10,
  },
  helperText: {
    fontSize: 14,
    color: '#3B82F6',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  footer: {
    marginTop: SPACING.xl,
  },
});

export default AddVaccineNameScreen;
