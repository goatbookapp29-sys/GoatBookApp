import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import api from '../api';
import { ArrowLeft } from 'lucide-react-native';

const ForgotPasswordScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      alert(response.data.message);
      navigation.navigate('ResetPassword', { email });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset code';
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
                <Text style={[styles.mainTitle, { color: theme.colors.primary, fontFamily: theme.typography.semiBold }]}>Forgot Password</Text>
                <Text style={[styles.subTitle, { color: theme.colors.textMuted, fontFamily: theme.typography.regular }]}>Enter your email to receive a reset code.</Text>
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
                
                <GButton 
                    title="Send Code" 
                    onPress={handleSendCode} 
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
  submitBtn: {
    marginTop: 40,
  },
});

export default ForgotPasswordScreen;
