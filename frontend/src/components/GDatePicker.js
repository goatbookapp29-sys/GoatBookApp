import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Animated } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SPACING } from '../theme';
import { Calendar } from 'lucide-react-native';

const GDatePicker = ({ label, value, onDateChange, required, placeholder = 'Select Date', containerStyle, error }) => {
  const [show, setShow] = useState(false);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  // Default date for picker if value is null
  const dateValue = value ? new Date(value) : new Date();

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: (value || show) ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, show]);

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

  const labelStyle = {
    position: 'absolute',
    left: 12,
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [14, -10],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [COLORS.textLight, error ? COLORS.error : COLORS.primary],
    }),
    backgroundColor: (value || show) ? COLORS.white : 'transparent',
    paddingHorizontal: (value || show) ? 4 : 0,
    zIndex: 1,
    fontWeight: (value || show) ? '600' : '400',
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity 
        style={[
          styles.inputWrapper,
          error && styles.inputError,
          show && styles.inputActive
        ]} 
        onPress={() => setShow(true)}
        activeOpacity={0.7}
      >
        <Animated.Text style={labelStyle} pointerEvents="none">
          {label}{required && '*'}
        </Animated.Text>

        {value || show ? (
          <Text style={[styles.valueText, !value && styles.placeholder]}>
            {value ? formatDate(value) : placeholder}
          </Text>
        ) : <View style={{ flex: 1 }} />}

        <Calendar size={20} color={COLORS.textLight} />
      </TouchableOpacity>

      {error ? (
        <View style={styles.errorContainer}>
           <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

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
  inputActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  valueText: {
    fontSize: 16,
    color: COLORS.text,
  },
  placeholder: {
    color: '#9CA3AF',
  },
  errorContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    paddingRight: 4,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '600',
  }
});

export default GDatePicker;
