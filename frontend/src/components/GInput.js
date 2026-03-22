import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TextInput, Text, Animated, Platform, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../theme';

const GInput = ({ 
  label, 
  value, 
  onChangeText, 
  secureTextEntry, 
  error, 
  keyboardType, 
  required,
  placeholder, // Destructure placeholder to handle it manually
  containerStyle,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: (isFocused || value) ? 1 : 0,
      duration: 200,
      useNativeDriver: false, // Label position and font size can't use native driver
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
      outputRange: [16, 12],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [COLORS.textLight, isFocused ? COLORS.primary : COLORS.textLight],
    }),
    backgroundColor: (isFocused || value) ? COLORS.white : 'transparent',
    paddingHorizontal: (isFocused || value) ? 4 : 0,
    zIndex: 1,
    fontWeight: (isFocused || value) ? '600' : '400',
  };

  const inputRef = useRef(null);
  const isMultiline = props.multiline;

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity 
        activeOpacity={1}
        onPress={() => inputRef.current?.focus()}
        style={[
          styles.inputWrapper, 
          isFocused && styles.inputFocused,
          error && styles.inputError,
          isMultiline && { height: 'auto', minHeight: 80, alignItems: 'flex-start', paddingTop: 16 }
        ]}
      >
        <Animated.Text 
          style={labelStyle} 
          pointerEvents="none" 
        >
          {label}{required && '*'}
        </Animated.Text>
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            isMultiline && { textAlignVertical: 'top', height: 'auto', minHeight: 60, marginTop: 4 },
            props.style
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          placeholder={(isFocused && !value) ? placeholder : ""} 
          placeholderTextColor="#9CA3AF"
          {...props}
        />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
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
    borderWidth: 1.5,
    borderColor: '#E5E7EB', 
    borderRadius: 12,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    height: 56,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, shadowHeight: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }
    })
  },
  inputError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    height: '100%',
    textAlignVertical: 'center',
    paddingTop: Platform.OS === 'ios' ? 0 : 4,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default GInput;
