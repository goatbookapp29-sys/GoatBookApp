import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from './index';

const ThemeThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const isDarkMode = false;

  const toggleTheme = () => {};

  const theme = lightTheme;

  return (
    <ThemeThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeThemeContext);
