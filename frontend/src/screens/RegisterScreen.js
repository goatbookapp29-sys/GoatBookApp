import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import api, { setAuthToken, setSelectedFarm } from '../api';

import { ArrowLeft } from 'lucide-react-native';

const RegisterScreen = ({ navigation }) => {
  const { isDarkMode, theme } = useTheme();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    farmName: '',
    farmLocation: ''
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Basic validation
    if (!formData.firstName || !formData.email || !formData.password || !formData.farmName) {
      alert('Please fill in required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
        farmName: formData.farmName,
        farmLocation: formData.farmLocation
      };

      const response = await api.post('/auth/register', payload);
      await setAuthToken(response.data.token);
      await setSelectedFarm(response.data.farm.id);
      setLoading(false);
      navigation.replace('Dashboard');
    } catch (error) {
      setLoading(false);
      console.error('REGISTER ERROR FULL:', error);
      console.error('REGISTER ERROR response:', error.response);
      console.error('REGISTER ERROR message:', error.message);
      let message = 'Registration failed';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      alert(message);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color={theme.colors.primary} size={32} />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
            <Text style={[styles.mainTitle, { color: theme.colors.primary, fontFamily: theme.typography.semiBold }]}>Register</Text>
            <Text style={[styles.subTitle, { color: theme.colors.textMuted, fontFamily: theme.typography.regular }]}>Start your journey to smarter goat farming.</Text>
        </View>

        <View style={styles.form}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary, fontFamily: theme.typography.semiBold }]}>Personal Details</Text>
            <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                    <GInput 
                        label="First Name" 
                        value={formData.firstName} 
                        onChangeText={(v) => updateField('firstName', v)} 
                        required 
                    />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                    <GInput 
                        label="Last Name" 
                        value={formData.lastName} 
                        onChangeText={(v) => updateField('lastName', v)} 
                    />
                </View>
            </View>
            <View style={styles.gap} />
            <GInput 
                label="Email" 
                value={formData.email} 
                onChangeText={(v) => updateField('email', v)} 
                placeholder="example@mail.com"
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
            <View style={styles.gap} />
            <GInput 
                label="Re-Type Password" 
                value={formData.confirmPassword} 
                onChangeText={(v) => updateField('confirmPassword', v)} 
                secureTextEntry 
                required 
            />

            <Text style={[styles.sectionTitle, { color: theme.colors.primary, fontFamily: theme.typography.semiBold, marginTop: 24 }]}>Farm Details</Text>
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

            <GButton 
                title="Register" 
                onPress={handleRegister} 
                loading={loading}
                containerStyle={styles.nextBtn}
            />

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.colors.textLight, fontFamily: theme.typography.medium }]}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={[styles.link, { color: theme.colors.primary, fontFamily: theme.typography.medium }]}>Login</Text>
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
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backButton: {
    paddingTop: 40,
    marginBottom: 20,
    marginLeft: -8,
  },
  titleContainer: {
    marginBottom: 40,
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
  sectionTitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gap: {
    height: 16,
  },
  nextBtn: {
    marginTop: 40,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    fontSize: 16,
  },
  link: {
    fontSize: 16,
    textDecorationLine: 'underline',
  }
});

export default RegisterScreen;
