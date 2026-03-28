import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import api from '../api';
import { ArrowLeft } from 'lucide-react-native';

const ResetPasswordScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { email: initialEmail } = route.params || {};
  
  const [email, setEmail] = useState(initialEmail || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email || !code || !newPassword || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', { 
        email, 
        code, 
        newPassword 
      });
      alert(response.data.message);
      navigation.navigate('Login');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password';
      alert(message);
    } finally {
      setLoading(false);
    }
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

        <View style={styles.formWrapper}>
            <View style={styles.titleContainer}>
                <Text style={[styles.mainTitle, { color: theme.colors.primary, fontFamily: theme.typography.semiBold }]}>Reset Password</Text>
                <Text style={[styles.subTitle, { color: theme.colors.textMuted, fontFamily: theme.typography.regular }]}>Enter the code sent to your email and your new password.</Text>
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
                    editable={!initialEmail}
                />
                <View style={styles.gap} />
                <GInput 
                    label="Reset Code" 
                    value={code} 
                    onChangeText={setCode} 
                    placeholder="123456"
                    keyboardType="number-pad"
                    required 
                />
                <View style={styles.gap} />
                <GInput 
                    label="New Password" 
                    value={newPassword} 
                    onChangeText={setNewPassword} 
                    secureTextEntry 
                    required 
                />
                <View style={styles.gap} />
                <GInput 
                    label="Confirm New Password" 
                    value={confirmPassword} 
                    onChangeText={setConfirmPassword} 
                    secureTextEntry 
                    required 
                />
                
                <GButton 
                    title="Reset Password" 
                    onPress={handleResetPassword} 
                    loading={loading}
                    containerStyle={styles.submitBtn}
                />
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
  formWrapper: {
    flex: 1,
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
  gap: {
    height: 16,
  },
  submitBtn: {
    height: 56,
    borderRadius: 10,
    marginTop: 40,
  },
});

export default ResetPasswordScreen;
