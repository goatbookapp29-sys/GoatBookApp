import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TextInput, Text, Animated, Platform, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../theme';

import { useTheme } from '../theme/ThemeContext';

const GInput = ({ 
  label, 
  value, 
  onChangeText, 
  secureTextEntry, 
  error, 
  keyboardType, 
  required,
  placeholder,
  containerStyle,
  ...props 
}) => {
  const { isDarkMode, theme } = useTheme();
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
      outputRange: [14, -10],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.colors.textLight, isFocused ? theme.colors.primary : theme.colors.textLight],
    }),
    backgroundColor: (isFocused || value) ? theme.colors.surface : 'transparent',
    paddingHorizontal: (isFocused || value) ? 4 : 0,
    zIndex: 1,
    fontWeight: (isFocused || value) ? '700' : '500',
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
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          isFocused && { borderColor: theme.colors.primary, borderWidth: 2 },
          error && { borderColor: theme.colors.error },
          isMultiline && { height: 'auto', minHeight: 80, alignItems: 'flex-start', paddingTop: 16 }
        ]}
      >
        <Animated.Text style={labelStyle} pointerEvents="none">
          {label}{required && '*'}
        </Animated.Text>
        <TextInput
          ref={inputRef}
          style={StyleSheet.flatten([
            styles.input,
            isMultiline && { textAlignVertical: 'top', height: 'auto', minHeight: 60, marginTop: 4 },
            props.style,
            { color: theme.colors.text },
          ])}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          placeholder={(isFocused && !value) ? placeholder : ""} 
          placeholderTextColor={theme.colors.textMuted}
          cursorColor={theme.colors.primary}
          selectionColor={theme.colors.primary + '40'}
          {...props}
        />
      </TouchableOpacity>
      {error && <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>}
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
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
    textAlignVertical: 'center',
    paddingTop: Platform.OS === 'ios' ? 0 : 4,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '600',
  },
});

export default GInput;
