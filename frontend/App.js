import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ProfileSettingsScreen from './src/screens/ProfileSettingsScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import BreedListScreen from './src/screens/BreedListScreen';
import AddBreedScreen from './src/screens/AddBreedScreen';
import AnimalListScreen from './src/screens/AnimalListScreen';
import AddAnimalScreen from './src/screens/AddAnimalScreen';
import EmployeeListScreen from './src/screens/EmployeeListScreen';
import AddEmployeeScreen from './src/screens/AddEmployeeScreen';
import FarmSelectionScreen from './src/screens/FarmSelectionScreen';
import { COLORS } from './src/theme';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const farmId = await SecureStore.getItemAsync('selectedFarmId');
      
      if (token && farmId) {
        setInitialRoute('Dashboard');
      } else {
        setInitialRoute('Login');
      }
    } catch (e) {
      setInitialRoute('Login');
    }
  };

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator 
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="BreedList" component={BreedListScreen} />
        <Stack.Screen name="AddBreed" component={AddBreedScreen} />
        <Stack.Screen name="EditBreed" component={AddBreedScreen} />
        <Stack.Screen name="AnimalList" component={AnimalListScreen} />
        <Stack.Screen name="AddAnimal" component={AddAnimalScreen} />
        <Stack.Screen name="EditAnimal" component={AddAnimalScreen} />
        <Stack.Screen name="EmployeeList" component={EmployeeListScreen} />
        <Stack.Screen name="AddEmployee" component={AddEmployeeScreen} />
        <Stack.Screen name="EditEmployee" component={AddEmployeeScreen} />
        <Stack.Screen name="FarmSelection" component={FarmSelectionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
