import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { COLORS, SPACING } from '../theme';
import GHeader from '../components/GHeader';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import api from '../api';

const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!currentPassword || !newPassword) {
      alert('Please fill in both fields');
      return;
    }

    if (newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await api.post('/users/change-password', {
        currentPassword,
        newPassword
      });
      setLoading(false);
      alert('Password updated successfully!');
      navigation.goBack();
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || 'Failed to update password';
      alert(message);
    }
  };

  return (
    <View style={styles.container}>
      <GHeader title="Change Password" onBack={() => navigation.goBack()} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            <GInput 
              label="Current Password" 
              value={currentPassword} 
              onChangeText={setCurrentPassword} 
              secureTextEntry 
              required 
            />
            
            <View style={styles.inputGap} />

            <GInput 
              label="New Password" 
              value={newPassword} 
              onChangeText={setNewPassword} 
              secureTextEntry 
              required 
            />
          </View>

          <View style={styles.footer}>
            <GButton 
              title="Save" 
              onPress={handleSave} 
              loading={loading}
              style={styles.saveBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    flexGrow: 1,
  },
  form: {
    marginTop: SPACING.md,
  },
  inputGap: {
    height: 10,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: SPACING.lg,
  },
  saveBtn: {
    height: 52,
    borderRadius: 8,
  },
});

export default ChangePasswordScreen;
