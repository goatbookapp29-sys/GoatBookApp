import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform, Animated } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../theme/ThemeContext';
import { lightTheme } from '../theme';
import { Calendar } from 'lucide-react-native';

const GDatePicker = ({ label, value, onDateChange, required, placeholder = 'Select Date', containerStyle, error }) => {
  const { isDarkMode, theme } = useTheme();
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
      outputRange: [theme.colors.textLight, error ? theme.colors.error : theme.colors.primary],
    }),
    backgroundColor: (value || show) ? theme.colors.surface : 'transparent',
    paddingHorizontal: (value || show) ? 4 : 0,
    zIndex: 1,
    fontWeight: (value || show) ? '700' : '500',
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity 
        style={[
          styles.inputWrapper,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          error && { borderColor: theme.colors.error, borderWidth: 2 },
          show && { borderColor: theme.colors.primary, borderWidth: 2 }
        ]} 
        onPress={() => setShow(true)}
        activeOpacity={0.7}
      >
        <Animated.Text style={labelStyle} pointerEvents="none">
          {label}{required && '*'}
        </Animated.Text>

        {value || show ? (
          <Text style={[styles.valueText, { color: theme.colors.text }, !value && { color: theme.colors.textMuted }]}>
            {value ? formatDate(value) : placeholder}
          </Text>
        ) : <View style={{ flex: 1 }} />}

        <Calendar size={20} color={theme.colors.textLight} />
      </TouchableOpacity>

      {error ? (
        <View style={styles.errorContainer}>
           <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 56,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    paddingRight: 4,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
  }
});

export default GDatePicker;
