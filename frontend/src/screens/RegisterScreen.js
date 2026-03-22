import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import api, { setAuthToken, setSelectedFarm } from '../api';

const RegisterScreen = ({ navigation }) => {
  const { isDarkMode, theme } = useTheme();
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
      await setSelectedFarm(response.data.farm.id);
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
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.title, { color: '#FFFFFF' }]}>Get Started</Text>
            <Text style={[styles.subtitle, { color: 'rgba(255,255,255,0.8)' }]}>Register your farm to continue</Text>
        </View>

        <View style={styles.formContainer}>
            <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Personal Details</Text>
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
                    <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Farm Details</Text>
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
                    title="Register Now" 
                    onPress={handleRegister} 
                    loading={loading}
                    containerStyle={styles.btn}
                />
            </View>

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.colors.textLight }]}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={[styles.link, { color: theme.colors.primary }]}>Sign In</Text>
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
    paddingHorizontal: 24,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 6,
    fontWeight: '600',
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
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2.5,
    marginBottom: 16,
  },
  gap: {
    height: 14,
  },
  btn: {
    marginTop: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 60,
  },
  footerText: {
    fontWeight: '700',
  },
  link: {
    fontWeight: '900',
    textDecorationLine: 'underline',
  }
});

export default RegisterScreen;
