import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { COLORS, SPACING } from '../theme';
import GHeader from '../components/GHeader';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import GSelect from '../components/GSelect';
import api from '../api';

const AddEmployeeScreen = ({ navigation, route }) => {
  const isEditing = !!route.params?.employee;
  const existingEmployee = route.params?.employee;

  const [name, setName] = useState(isEditing ? existingEmployee.User?.name : '');
  const [phone, setPhone] = useState(isEditing ? existingEmployee.User?.phone : '');
  const [password, setPassword] = useState(''); // Only for new employees
  const [role, setRole] = useState(isEditing ? existingEmployee.employeeType : 'EMPLOYEE');
  
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !phone || (!isEditing && !password)) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        // Update logic (to be implemented in backend)
        await api.put(`/users/employees/${existingEmployee.id}`, { name, role });
      } else {
        // Create logic
        await api.post('/users/employees', { name, phone, password, role });
      }
      setLoading(false);
      navigation.goBack();
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || 'Operation failed';
      alert(message);
    }
  };

  return (
    <View style={styles.container}>
      <GHeader 
        title={isEditing ? "Edit Employee" : "Add Employee"} 
        onBack={() => navigation.goBack()} 
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Employee Information</Text>
            <GInput 
              label="Full Name" 
              value={name} 
              onChangeText={setName} 
              required 
            />
            
            <View style={styles.gap} />
            
            <GInput 
              label="Phone Number" 
              value={phone} 
              onChangeText={setPhone} 
              keyboardType="phone-pad"
              editable={!isEditing}
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
                  required 
                />
              </>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Role & Permissions</Text>
            <GSelect 
              label="Role" 
              value={role} 
              onSelect={setRole}
              options={[
                { label: 'Regular Employee', value: 'EMPLOYEE' },
                { label: 'Butcher', value: 'BUTCHER' },
                { label: 'Sales Agent', value: 'AGENT' }
              ]}
              required
            />
          </View>

          <View style={styles.footer}>
            <GButton 
              title={isEditing ? "Update Employee" : "Create Account"} 
              onPress={handleSave}
              loading={loading}
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
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.lg,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gap: {
    height: 16,
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: SPACING.xl,
  }
});

export default AddEmployeeScreen;
