import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import GHeader from '../components/GHeader';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import GSelect from '../components/GSelect';
import api from '../api';
import { KeyRound, Mail, User, Camera, ImageIcon, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

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
  const [profilePhoto, setProfilePhoto] = useState(isEditing ? existingEmployee.profilePhotoUrl : null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  const uploadToCloudinary = async (imageUri) => {
    if (!imageUri || imageUri.startsWith('http')) return imageUri;
    try {
      setUploading(true);
      const data = new FormData();
      data.append('upload_preset', 'goatbook_preset');
      data.append('cloud_name', 'dvtfv9vvr');

      if (Platform.OS === 'web') {
        const blobResponse = await fetch(imageUri);
        const blob = await blobResponse.blob();
        data.append('file', blob, 'upload.jpg');
      } else {
        const fileName = imageUri.split('/').pop();
        const fileType = fileName.split('.').pop();
        data.append('file', {
          uri: imageUri,
          name: fileName || 'upload.jpg',
          type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
        });
      }

      const response = await fetch('https://api.cloudinary.com/v1_1/dvtfv9vvr/image/upload', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) throw new Error('Cloudinary Upload Failed');
      const resData = await response.json();
      setUploading(false);
      return resData.secure_url;
    } catch (error) {
      setUploading(false);
      console.error('Upload error:', error);
      Alert.alert('Upload Error', 'Failed to upload photo. Please check your connection.');
      throw error;
    }
  };

  const handleSave = async () => {
    if (!name || !email || (!isEditing && !password)) {
      Alert.alert('Validation Error', 'Please fill in Name, Email, and Password');
      return;
    }

    setLoading(true);
    try {
      let uploadedPhotoUrl = profilePhoto;
      if (profilePhoto && !profilePhoto.startsWith('http')) {
        uploadedPhotoUrl = await uploadToCloudinary(profilePhoto);
      }

      if (isEditing) {
        await api.put(`/users/employees/${existingEmployee.id}`, { name, role, email, phone, state, profilePhotoUrl: uploadedPhotoUrl });
        Alert.alert('Success', 'Employee updated successfully');
      } else {
        await api.post('/users/employees', { name, email, password, role, phone, state });
        // Photo can only be added when editing (after creation)
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
        rightIcon={
          <View style={{ 
            backgroundColor: state === 'Terminated' ? theme.colors.error : (theme.colors.success || '#10B981'), 
            paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, opacity: 0.9,
            width: 75, alignItems: 'center'
          }}>
            <Text style={{ color: 'white', fontSize: 9, fontFamily: 'Inter_700Bold' }}>
              {state === 'Terminated' ? 'TERMINATED' : 'WORKING'}
            </Text>
          </View>
        }
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Profile Photo Section */}
          <View style={styles.photoSection}>
            <TouchableOpacity style={[styles.avatarCircle, { borderColor: theme.colors.primary }]} onPress={pickImage}>
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary + '15' }]}>
                  <User size={40} color={theme.colors.primary} />
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.photoActions}>
              <TouchableOpacity style={[styles.photoBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} onPress={takePhoto}>
                <Camera size={16} color={theme.colors.primary} />
                <Text style={[styles.photoBtnText, { color: theme.colors.text }]}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.photoBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]} onPress={pickImage}>
                <ImageIcon size={16} color={theme.colors.primary} />
                <Text style={[styles.photoBtnText, { color: theme.colors.text }]}>Gallery</Text>
              </TouchableOpacity>
              {profilePhoto && (
                <TouchableOpacity style={[styles.photoBtn, { backgroundColor: theme.colors.error + '10', borderColor: theme.colors.error + '30' }]} onPress={() => setProfilePhoto(null)}>
                  <Trash2 size={16} color={theme.colors.error} />
                </TouchableOpacity>
              )}
            </View>
          </View>

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
              title={uploading ? "Uploading photo..." : (isEditing ? "Save changes" : "Create employee")} 
              onPress={handleSave}
              loading={loading && !showPasswordReset}
              disabled={uploading}
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
  photoSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingTop: 8,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  photoBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  section: {
    marginBottom: SPACING.xl,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
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
    fontFamily: 'Inter_600SemiBold',
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
    fontFamily: 'Inter_600SemiBold',
  },
  confirmText: {
    fontFamily: 'Inter_600SemiBold',
  },
  footer: {
    paddingVertical: SPACING.xl,
    marginTop: 'auto',
  }
});

export default AddEmployeeScreen;
