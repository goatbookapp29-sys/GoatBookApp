import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { COLORS, SPACING } from '../theme';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import { ChevronLeft } from 'lucide-react-native';
import api from '../api';

const RegisterScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      alert('All fields are required');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/auth/register', { 
        first_name: firstName, 
        last_name: lastName, 
        email, 
        password 
      });
      setLoading(false);
      alert('Registration successful! Please login.');
      navigation.navigate('Login');
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || 'Registration failed.';
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft color={COLORS.primary} size={32} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Register</Text>
            <Text style={styles.subtitle}>Start your journey to smarter goat farming.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: SPACING.sm }}>
                <GInput
                  label="First Name"
                  value={firstName}
                  onChangeText={setFirstName}
                  required
                />
              </View>
              <View style={{ flex: 1 }}>
                <GInput
                  label="Last Name"
                  value={lastName}
                  onChangeText={setLastName}
                  required
                />
              </View>
            </View>

            <GInput
              label="Email/Phone"
              value={email}
              onChangeText={setEmail}
              required
            />
            <GInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              required
            />
            <GInput
              label="Re-Type Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              required
            />

            <GButton 
              title="Next" 
              onPress={handleRegister} 
              loading={loading}
              style={styles.registerBtn}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Login</Text>
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
  },
  backBtn: {
    marginTop: SPACING.sm,
    marginLeft: -SPACING.sm,
  },
  header: {
    marginVertical: SPACING.lg,
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
  row: {
    flexDirection: 'row',
  },
  registerBtn: {
    marginTop: SPACING.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  footerText: {
    color: COLORS.textLight,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
