import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import api, { setAuthToken } from '../api';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    farmName: '',
    farmLocation: ''
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.farmName) {
      alert('Please fill in all required fields (Name, Email, Phone, Password, and Farm Name)');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/register', formData);
      await setAuthToken(response.data.token);
      setLoading(false);
      navigation.replace('Dashboard');
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || 'Registration failed';
      alert(message);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Register as a Farm Owner</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <GInput 
            label="Full Name" 
            value={formData.name} 
            onChangeText={(v) => updateField('name', v)} 
            required 
          />
          <View style={styles.gap} />
          <GInput 
            label="Phone Number" 
            value={formData.phone} 
            onChangeText={(v) => updateField('phone', v)} 
            keyboardType="phone-pad"
            required 
          />
          <View style={styles.gap} />
          <GInput 
            label="Email Address" 
            value={formData.email} 
            onChangeText={(v) => updateField('email', v)} 
            keyboardType="email-address"
            autoCapitalize="none"
            required
          />
          <View style={styles.gap} />
          <GInput 
            label="Password" 
            value={formData.password} 
            onChangeText={(v) => updateField('password', v)} 
            secureTextEntry 
            required 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Farm Details</Text>
          <GInput 
            label="Farm Name" 
            value={formData.farmName} 
            onChangeText={(v) => updateField('farmName', v)} 
            required 
          />
          <View style={styles.gap} />
          <GInput 
            label="Farm Location" 
            value={formData.farmLocation} 
            onChangeText={(v) => updateField('farmLocation', v)} 
          />
        </View>

        <GButton 
          title="Register & Create Farm" 
          onPress={handleRegister} 
          loading={loading}
          style={styles.btn}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Login</Text>
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
    padding: SPACING.xl,
    paddingTop: 60,
  },
  header: {
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 4,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  gap: {
    height: 12,
  },
  btn: {
    marginTop: SPACING.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  footerText: {
    color: COLORS.textLight,
  },
  link: {
    color: COLORS.primary,
    fontWeight: 'bold',
  }
});

export default RegisterScreen;
