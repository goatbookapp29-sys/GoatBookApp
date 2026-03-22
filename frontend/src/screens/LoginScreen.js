import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import api, { setAuthToken, setSelectedFarm } from '../api';

const LoginScreen = ({ navigation }) => {
  const { isDarkMode, theme } = useTheme();
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
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
            <View style={[styles.logoCircle, { backgroundColor: '#FFFFFF' }]}>
                <Text style={styles.logoText}>GB</Text>
            </View>
            <Text style={[styles.appName, { color: '#FFFFFF' }]}>GoatBook</Text>
            <Text style={[styles.appTagline, { color: 'rgba(255,255,255,0.8)' }]}>Modern Farm Management</Text>
        </View>

        <View style={styles.formContainer}>
            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <Text style={[styles.welcomeTitle, { color: theme.colors.text }]}>Welcome Back</Text>
                <Text style={[styles.welcomeSub, { color: theme.colors.textLight }]}>Manage your farm with ease</Text>

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
                <View style={{ height: 16 }} />
                <GInput 
                    label="Password" 
                    value={password} 
                    onChangeText={setPassword} 
                    secureTextEntry 
                    required 
                />
                
                <TouchableOpacity style={styles.forgotPass}>
                    <Text style={[styles.forgotText, { color: theme.colors.primary }]}>Forgot Password?</Text>
                </TouchableOpacity>

                <GButton 
                    title="Sign In" 
                    onPress={handleLogin} 
                    loading={loading}
                />
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.colors.textLight }]}>New to GoatBook? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={[styles.link, { color: theme.colors.primary }]}>Create Account</Text>
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
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 80,
    paddingBottom: 70,
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 44,
    fontWeight: '900',
    color: '#312E81',
  },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    marginTop: 16,
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  formContainer: {
    paddingHorizontal: 20,
    marginTop: -40,
  },
  card: {
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  welcomeSub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 32,
    fontWeight: '600',
  },
  form: {
    marginTop: 0,
  },
  forgotPass: {
    alignSelf: 'flex-end',
    marginVertical: 16,
    marginBottom: 32,
  },
  forgotText: {
    fontWeight: '800',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  footerText: {
    fontWeight: '700',
  },
  link: {
    fontWeight: '900',
    textDecorationLine: 'underline',
  }
});

export default LoginScreen;
