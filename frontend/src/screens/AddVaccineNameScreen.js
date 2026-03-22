import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import GHeader from '../components/GHeader';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import api from '../api';
import { useFocusEffect } from '@react-navigation/native';
import { ListPlus } from 'lucide-react-native';

const AddVaccineNameScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [daysBetween, setDaysBetween] = useState('');
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);
  const [vaccines, setVaccines] = useState([]);
  const [vaccinesLoading, setVaccinesLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchVaccines();
    }, [])
  );

  const fetchVaccines = async () => {
    try {
      setVaccinesLoading(true);
      const response = await api.get('/vaccines');
      setVaccines(response.data);
      setVaccinesLoading(false);
    } catch (error) {
      console.error('Fetch vaccines error:', error);
      setVaccinesLoading(false);
    }
  };

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
      Alert.alert('Success', 'Vaccine name added successfully');
      setName('');
      setDaysBetween('');
      setRemark('');
      fetchVaccines(); // Refresh the list
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

          {/* List View for Vaccine Names */}
          <View style={styles.listSection}>
            <Text style={styles.sectionTitle}>Existing Vaccines</Text>
            {vaccinesLoading ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : vaccines.length > 0 ? (
              vaccines.map((v) => (
                <View key={v.id} style={styles.vaccineItem}>
                  <View style={styles.vaccineIcon}>
                    <ListPlus size={20} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.vaccineLabel}>{v.name}</Text>
                    <Text style={styles.vaccineDays}>Every {v.daysBetween} days</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No vaccines defined yet</Text>
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
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: SPACING.lg,
  },
  formCard: {
    paddingBottom: SPACING.lg,
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
    marginTop: SPACING.md,
    marginBottom: 30,
  },
  listSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  vaccineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  vaccineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vaccineLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  vaccineDays: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textLight,
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default AddVaccineNameScreen;
