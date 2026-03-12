import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { COLORS, SPACING } from '../theme';

const GButton = ({ title, onPress, loading, style, textStyle, variant = 'primary' }) => {
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        isOutline ? styles.buttonOutline : styles.buttonPrimary,
        style,
        loading && styles.buttonDisabled
      ]} 
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? COLORS.primary : COLORS.white} />
      ) : (
        <Text style={[
          styles.text, 
          isOutline ? styles.textOutline : styles.textPrimary,
          textStyle
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginVertical: SPACING.sm,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
  textPrimary: {
    color: COLORS.white,
  },
  textOutline: {
    color: COLORS.primary,
  },
});

export default GButton;
