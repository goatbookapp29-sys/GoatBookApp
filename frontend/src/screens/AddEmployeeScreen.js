import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import GHeader from '../components/GHeader';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import GSelect from '../components/GSelect';
import api from '../api';
import { KeyRound, Mail, User } from 'lucide-react-native';

const AddEmployeeScreen = ({ navigation, route }) => {
  const isEditing = !!route.params?.employee;
  const existingEmployee = route.params?.employee;

  const [name, setName] = useState(isEditing ? existingEmployee.name : '');
  const [email, setEmail] = useState(isEditing ? existingEmployee.email : '');
  const [password, setPassword] = useState(''); // Only used for registration or reset
  const [role, setRole] = useState(isEditing ? existingEmployee.role : 'EMPLOYEE');
  
  const [loading, setLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const handleSave = async () => {
    if (!name || !email || (!isEditing && !password)) {
      alert('Please fill in Name, Email, and Password');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/users/employees/${existingEmployee.id}`, { name, role });
        alert('Employee updated successfully');
      } else {
        await api.post('/users/employees', { name, email, password, role });
        alert('Employee created successfully');
      }
      setLoading(false);
      navigation.goBack();
    } catch (error) {
      setLoading(false);
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleResetPassword = async () => {
    if (!password) {
      alert('Please enter a new password');
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
    <View style={styles.container}>
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
            <Text style={styles.sectionTitle}>Identity Details</Text>
            
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
              editable={!isEditing} // Email cannot be edited as per requirement
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
            <Text style={styles.sectionTitle}>Work Role</Text>
            <GSelect 
              label="Assigned Role" 
              value={role} 
              onSelect={setRole}
              options={[
                { label: 'Farm Worker', value: 'EMPLOYEE' },
                { label: 'Butcher', value: 'BUTCHER' },
                { label: 'Agent', value: 'AGENT' }
              ]}
              required
            />
          </View>

          {isEditing && (
            <View style={styles.resetSection}>
              {!showPasswordReset ? (
                <TouchableOpacity 
                  style={styles.resetTrigger} 
                  onPress={() => setShowPasswordReset(true)}
                >
                  <KeyRound size={20} color={COLORS.primary} />
                  <Text style={styles.resetTriggerText}>Reset Employee Password</Text>
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
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleResetPassword}>
                      <Text style={styles.confirmText}>Reset Now</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    flexGrow: 1,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.lg,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  gap: {
    height: 16,
  },
  resetSection: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  resetTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
  },
  resetTriggerText: {
    marginLeft: 10,
    color: COLORS.primary,
    fontWeight: '600',
  },
  resetBox: {
    marginTop: SPACING.sm,
  },
  resetActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
    gap: 20,
  },
  cancelText: {
    color: COLORS.textLight,
    fontWeight: '600',
  },
  confirmText: {
    color: COLORS.error,
    fontWeight: '700',
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: SPACING.xl,
  }
});

export default AddEmployeeScreen;
