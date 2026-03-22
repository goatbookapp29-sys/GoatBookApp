import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Animated, Easing } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Moon, Sun } from 'lucide-react-native';

const GThemeToggle = () => {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isDarkMode ? 1 : 0,
      duration: 300,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
      useNativeDriver: false,
    }).start();
  }, [isDarkMode]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 26], // Adjusted based on toggle width
  });

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={toggleTheme} 
      style={[
        styles.container, 
        { 
          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
          borderColor: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.05)',
        }
      ]}
    >
      <View style={styles.iconContainer}>
        <Sun size={14} color={isDarkMode ? 'rgba(255,255,255,0.4)' : '#F59E0B'} fill={isDarkMode ? 'transparent' : '#F59E0B'} />
        <Moon size={14} color={isDarkMode ? '#818CF8' : 'rgba(0,0,0,0.4)'} fill={isDarkMode ? '#818CF8' : 'transparent'} />
      </View>
      <Animated.View 
        style={[
          styles.knob, 
          { 
            transform: [{ translateX }],
            backgroundColor: 'white',
            ...theme.shadow.sm,
          }
        ]} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 52,
    height: 28,
    borderRadius: 14,
    padding: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  iconContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    width: '100%',
    zIndex: 0,
  },
  knob: {
    position: 'absolute',
    left: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    zIndex: 1,
  },
});

export default GThemeToggle;
