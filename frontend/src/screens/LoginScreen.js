import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { COLORS, SPACING } from '../theme';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import api, { setAuthToken } from '../api';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter both email/phone and password');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      await setAuthToken(token);
      setLoading(false);
      navigation.replace('Dashboard');
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      alert(message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>Login to Goatwala Farm APP!</Text>
          </View>

          <View style={styles.form}>
            <GInput
              label="Email/Phone"
              value={email}
              onChangeText={setEmail}
            />
            <GInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <GButton 
              title="Login" 
              onPress={handleLogin} 
              loading={loading}
              style={styles.loginBtn}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  form: {
    width: '100%',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
  },
  forgotText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  loginBtn: {
    marginTop: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    color: COLORS.textLight,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
