import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TextInput, Text, Animated, Platform } from 'react-native';
import { COLORS, SPACING } from '../theme';

const GInput = ({ 
  label, 
  value, 
  onChangeText, 
  secureTextEntry, 
  error, 
  keyboardType, 
  required,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: (isFocused || value) ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: 'absolute',
    left: 12,
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [14, -10], // Moves to top border
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [15, 12],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [COLORS.textLight, COLORS.textLight],
    }),
    backgroundColor: (isFocused || value) ? COLORS.white : 'transparent',
    paddingHorizontal: (isFocused || value) ? 4 : 0,
    zIndex: 1,
  };

  return (
    <View style={styles.container}>
      <View style={[
        styles.inputWrapper, 
        isFocused && styles.inputFocused,
        error && styles.inputError
      ]}>
        <Animated.Text style={labelStyle}>
          {label}{required && '*'}
        </Animated.Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB', // Light gray border
    borderRadius: 8,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    height: 52,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    height: '100%',
    paddingTop: Platform.OS === 'ios' ? 0 : 4, // Adjust for vertical centering
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 2,
    marginLeft: 4,
  },
});

export default GInput;
