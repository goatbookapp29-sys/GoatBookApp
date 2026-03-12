import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import api, { setAuthToken, setSelectedFarm } from '../api';

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState(''); // Can be email or phone
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier || !password) {
      alert('Please enter your credentials');
      return;
    }

    setLoading(true);
    try {
      // Logic to check if identifier is email-like or phone-like
      const isEmail = identifier.includes('@');
      
      const payload = isEmail 
        ? { email: identifier, password } 
        : { phone: identifier, password };

      const response = await api.post('/auth/login', payload);
      const { token, farms, user } = response.data;
      
      await setAuthToken(token);
      
      // Multi-farm logic
      if (farms && farms.length > 1) {
        setLoading(false);
        navigation.replace('FarmSelection', { farms });
      } else if (farms && farms.length === 1) {
        await setSelectedFarm(farms[0].id);
        setLoading(false);
        navigation.replace('Dashboard');
      } else {
        alert('No farms found for this account.');
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || 'Login failed';
      alert(message);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>GB</Text>
          </View>
          <Text style={styles.appName}>GoatBook</Text>
          <Text style={styles.appTagline}>Farm Management System</Text>
        </View>

        <View style={styles.form}>
          <GInput 
            label="Email or Phone Number" 
            value={identifier} 
            onChangeText={setIdentifier} 
            placeholder="example@mail.com or 1234567890"
            required 
          />
          <View style={styles.gap} />
          <GInput 
            label="Password" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
            required 
          />
          
          <TouchableOpacity style={styles.forgotPass}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <GButton 
            title="Login" 
            onPress={handleLogin} 
            loading={loading}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to GoatBook? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.md,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
  },
  appTagline: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  form: {
    marginTop: SPACING.md,
  },
  gap: {
    height: 16,
  },
  forgotPass: {
    alignSelf: 'flex-end',
    marginVertical: SPACING.md,
    marginBottom: SPACING.xl,
  },
  forgotText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    color: COLORS.textLight,
  },
  link: {
    color: COLORS.primary,
    fontWeight: 'bold',
  }
});

export default LoginScreen;
