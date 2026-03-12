import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ProfileSettingsScreen from './src/screens/ProfileSettingsScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import BreedListScreen from './src/screens/BreedListScreen';
import AddBreedScreen from './src/screens/AddBreedScreen';
import { COLORS } from './src/theme';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator 
        initialRouteName="Login"
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
