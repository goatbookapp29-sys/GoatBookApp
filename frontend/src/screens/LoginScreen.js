import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import api, { setAuthToken, setSelectedFarm } from '../api';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter your email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, farms } = response.data;
      
      await setAuthToken(token);
      
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
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.header}>
            <View style={styles.logoCircle}>
                <Text style={styles.logoText}>GB</Text>
            </View>
            <Text style={styles.appName}>GoatBook</Text>
            <Text style={styles.appTagline}>Modern Farm Management</Text>
        </View>

        <View style={styles.formContainer}>
            <View style={styles.card}>
                <Text style={styles.welcomeTitle}>Welcome Back</Text>
                <Text style={styles.welcomeSub}>Manage your farm with ease</Text>

                <View style={styles.form}>
                <GInput 
                    label="Email Address" 
                    value={email} 
                    onChangeText={setEmail} 
                    placeholder="example@mail.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    required 
                />
                <View style={{ height: 12 }} />
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
                    title="Sign In" 
                    onPress={handleLogin} 
                    loading={loading}
                />
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>New to GoatBook? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.link}>Create Account</Text>
                </TouchableOpacity>
            </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 80,
    paddingBottom: 60,
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    ...SHADOW.lg,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.md,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.primary,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.white,
    marginTop: 16,
    letterSpacing: 1,
  },
  appTagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    fontWeight: '500',
  },
  formContainer: {
    paddingHorizontal: 20,
    marginTop: -40,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 24,
    ...SHADOW.lg,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  welcomeSub: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
    fontWeight: '500',
  },
  form: {
    marginTop: 0,
  },
  forgotPass: {
    alignSelf: 'flex-end',
    marginVertical: 16,
    marginBottom: 24,
  },
  forgotText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  footerText: {
    color: COLORS.textLight,
    fontWeight: '600',
  },
  link: {
    color: COLORS.primary,
    fontWeight: '800',
    textDecorationLine: 'underline',
  }
});

export default LoginScreen;
