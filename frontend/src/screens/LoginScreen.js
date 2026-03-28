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
      const response = await api.post('/auth/login', { identifier: email, password });
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
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.formWrapper}>
            <View style={styles.titleContainer}>
                <Text style={[styles.mainTitle, { color: theme.colors.primary, fontFamily: theme.typography.semiBold }]}>Login</Text>
                <Text style={[styles.subTitle, { color: theme.colors.textMuted, fontFamily: theme.typography.regular }]}>Login to Goatwala Farm APP!</Text>
            </View>

            <View style={styles.form}>
                <GInput 
                    label="Email" 
                    value={email} 
                    onChangeText={setEmail} 
                    placeholder="example@mail.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    required 
                />
                <View style={{ height: 20 }} />
                <GInput 
                    label="Password" 
                    value={password} 
                    onChangeText={setPassword} 
                    secureTextEntry 
                    required 
                />
                
                <TouchableOpacity 
                    style={styles.forgotPass}
                    onPress={() => navigation.navigate('ForgotPassword')}
                >
                    <Text style={[styles.forgotText, { color: theme.colors.primary, fontFamily: theme.typography.medium }]}>Forgot password?</Text>
                </TouchableOpacity>

                <GButton 
                    title="Login" 
                    onPress={handleLogin} 
                    loading={loading}
                    containerStyle={styles.loginBtn}
                />

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.colors.textLight, fontFamily: theme.typography.medium }]}>Don’t have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={[styles.link, { color: theme.colors.primary, fontFamily: theme.typography.medium }]}>Register</Text>
                    </TouchableOpacity>
                </View>
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
    paddingHorizontal: 24,
  },
  formWrapper: {
    paddingTop: 80,
    flex: 1,
  },
  titleContainer: {
    marginBottom: 60,
  },
  mainTitle: {
    fontSize: 28,
    letterSpacing: -0.5,
  },
  subTitle: {
    fontSize: 16,
    marginTop: 8,
  },
  form: {
    flex: 1,
  },
  forgotPass: {
    alignSelf: 'flex-end',
    marginTop: 12,
    marginBottom: 30,
  },
  forgotText: {
    fontSize: 14,
  },
  loginBtn: {
    marginTop: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 16,
  },
  link: {
    fontSize: 16,
    textDecorationLine: 'underline',
  }
});

export default LoginScreen;
