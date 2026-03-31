import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import GHeader from '../components/GHeader';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import GSelect from '../components/GSelect';
import api from '../api';
import { KeyRound, Mail, User } from 'lucide-react-native';

const AddEmployeeScreen = ({ navigation, route }) => {
  const { isDarkMode, theme } = useTheme();
  const styles = useMemo(() => getStyles(theme, isDarkMode), [theme, isDarkMode]);
  const isEditing = !!route.params?.employee;
  const existingEmployee = route.params?.employee;

  const [name, setName] = useState(isEditing ? existingEmployee.name : '');
  const [email, setEmail] = useState(isEditing ? existingEmployee.email : '');
  const [password, setPassword] = useState(''); // Only used for registration or reset
  const [phone, setPhone] = useState(isEditing ? existingEmployee.phone : '');
  const [role, setRole] = useState(isEditing ? existingEmployee.role : 'EMPLOYEE');
  const [state, setState] = useState(isEditing ? existingEmployee.state || 'Working' : 'Working');
  
  const [loading, setLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const handleSave = async () => {
    if (!name || !email || (!isEditing && !password)) {
      Alert.alert('Validation Error', 'Please fill in Name, Email, and Password');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/users/employees/${existingEmployee.id}`, { name, role, email, phone, state });
        Alert.alert('Success', 'Employee updated successfully');
      } else {
        await api.post('/users/employees', { name, email, password, role, phone, state });
        Alert.alert('Success', 'Employee created successfully');
      }
      setLoading(false);
      navigation.goBack();
    } catch (error) {
      setLoading(false);
      const msg = error.response?.data?.message || 'Operation failed';
      const detail = error.response?.data?.error ? `\n\nDetail: ${error.response.data.error}` : '';
      Alert.alert('Error', `${msg}${detail}`);
    }
  };

  const handleResetPassword = async () => {
    if (!password) {
      Alert.alert('Validation Error', 'Please enter a new password');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/users/employees/${existingEmployee.id}/reset-password`, { newPassword: password });
      alert('Employee password reset successfully');
      setPassword('');
      setShowPasswordReset(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert('Failed to reset password');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GHeader 
        title={isEditing ? "Edit employee" : "Add employee"} 
        onBack={() => navigation.goBack()} 
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Identity Details</Text>
            
            <GInput 
              label="Full Name" 
              value={name} 
              onChangeText={setName} 
              placeholder="Deepak Kumar"
              required 
            />
            
            <View style={styles.gap} />
            
            <GInput 
              label="Email Address" 
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address"
              autoCapitalize="none"
              required 
            />

            <View style={styles.gap} />

            <GInput 
              label="Phone Number" 
              value={phone} 
              onChangeText={setPhone} 
              keyboardType="phone-pad"
              required 
            />

            {!isEditing && (
              <>
                <View style={styles.gap} />
                <GInput 
                  label="Temporary Password" 
                  value={password} 
                  onChangeText={setPassword} 
                  secureTextEntry 
                  placeholder="Set login password"
                  required 
                />
              </>
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Work Role</Text>
            <GSelect 
              label="Assigned Role" 
              value={role} 
              onSelect={setRole}
              options={[
                { label: 'Manager', value: 'MANAGER' },
                { label: 'Supervisor', value: 'SUPERVISOR' },
                { label: 'Veterinarian', value: 'VETERINARIAN' },
                { label: 'Farm Worker', value: 'EMPLOYEE' },
                { label: 'Butcher', value: 'BUTCHER' },
                { label: 'Agent', value: 'AGENT' }
              ]}
              required
            />
            <View style={styles.gap} />
            <GSelect 
              label="Employment State" 
              value={state} 
              onSelect={setState}
              options={[
                { label: 'Working', value: 'Working' },
                { label: 'Terminated', value: 'Terminated' }
              ]}
              required
            />
          </View>

          {isEditing && (
            <View style={[styles.resetSection, { backgroundColor: theme.colors.surface }]}>
              {!showPasswordReset ? (
                <TouchableOpacity 
                  style={styles.resetTrigger} 
                  onPress={() => setShowPasswordReset(true)}
                >
                  <KeyRound size={20} color={theme.colors.primary} />
                  <Text style={[styles.resetTriggerText, { color: theme.colors.primary }]}>Reset Employee Password</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.resetBox}>
                  <GInput 
                    label="New Password" 
                    value={password} 
                    onChangeText={setPassword} 
                    secureTextEntry 
                    placeholder="Enter new password"
                  />
                  <View style={styles.resetActions}>
                    <TouchableOpacity onPress={() => setShowPasswordReset(false)}>
                      <Text style={[styles.cancelText, { color: theme.colors.textLight }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleResetPassword}>
                      <Text style={[styles.confirmText, { color: theme.colors.error }]}>Reset Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          <View style={styles.footer}>
            <GButton 
              title={isEditing ? "Save changes" : "Create employee"} 
              onPress={handleSave}
              loading={loading && !showPasswordReset}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    flexGrow: 1,
    paddingBottom: 40,
  },
  section: {
    marginBottom: SPACING.xl,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
    marginBottom: SPACING.md,
    letterSpacing: 0.5,
    borderBottomWidth: 1.5,
    borderBottomColor: theme.colors.border,
    paddingBottom: 8,
  },
  gap: {
    height: 16,
  },
  resetSection: {
    marginTop: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  resetTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xs,
  },
  resetTriggerText: {
    marginLeft: 12,
    fontFamily: 'Montserrat_600SemiBold',
  },
  resetBox: {
    marginTop: SPACING.sm,
  },
  resetActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
    gap: 24,
  },
  cancelText: {
    fontFamily: 'Montserrat_600SemiBold',
  },
  confirmText: {
    fontFamily: 'Montserrat_600SemiBold',
  },
  footer: {
    paddingVertical: SPACING.xl,
    marginTop: 'auto',
  }
});

export default AddEmployeeScreen;
