import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SPACING } from '../theme';
import { Calendar } from 'lucide-react-native';

const GDatePicker = ({ label, value, onDateChange, required, placeholder = 'Select Date' }) => {
  const [show, setShow] = useState(false);

  // Default date for picker if value is null
  const dateValue = value ? new Date(value) : new Date();

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateValue;
    setShow(Platform.OS === 'ios');
    if (event.type === 'set' || Platform.OS === 'ios') {
      onDateChange(currentDate.toISOString().split('T')[0]);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}{required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <TouchableOpacity 
        style={styles.inputWrapper} 
        onPress={() => setShow(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.valueText, !value && styles.placeholder]}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <Calendar size={20} color={COLORS.textLight} />
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={dateValue}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChange}
          maximumDate={new Date()} // Can't be born in the future
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    width: '100%',
  },
  label: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
    marginLeft: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  required: {
    color: COLORS.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    height: 56,
  },
  valueText: {
    fontSize: 16,
    color: COLORS.text,
  },
  placeholder: {
    color: '#9CA3AF',
  }
});

export default GDatePicker;
