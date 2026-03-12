import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { COLORS, SPACING } from '../theme';
import GHeader from '../components/GHeader';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import api from '../api';

const AddBreedScreen = ({ navigation, route }) => {
  const isEditing = !!route.params?.breed;
  const existingBreed = route.params?.breed;

  const [name, setName] = useState(isEditing ? existingBreed.name : '');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('Please enter a breed name');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/breeds/${existingBreed.id}`, { name });
      } else {
        await api.post('/breeds', { name, animalType: 'Goat' });
      }
      setLoading(false);
      navigation.goBack();
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || 'Something went wrong';
      alert(message);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/breeds/${existingBreed.id}`);
      setDeleting(false);
      navigation.goBack();
    } catch (error) {
      setDeleting(false);
      alert('Failed to delete breed');
    }
  };

  return (
    <View style={styles.container}>
      <GHeader 
        title={isEditing ? "Add New Breed" : "Add New Breed"} 
        onBack={() => navigation.goBack()} 
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formRow}>
            <View style={styles.animalTypeBox}>
              <Text style={styles.label}>Animal Type</Text>
              <Text style={styles.animalValue}>Goat</Text>
            </View>
            <View style={styles.inputBox}>
              <GInput 
                label="Breed" 
                value={name} 
                onChangeText={setName} 
                required 
              />
            </View>
          </View>

          <Text style={styles.note}>
            <Text style={styles.noteBold}>Note : </Text>
            Application is designed to manage Goat & Sheep. Default Goat is enable to use. From Farm settings you can enable Sheep or both(Goat & Sheep)
          </Text>

          <View style={styles.footer}>
            {isEditing ? (
              <View style={styles.buttonRow}>
                <View style={styles.halfWidth}>
                  <GButton 
                    title="Delete" 
                    onPress={handleDelete} 
                    variant="outline"
                    loading={deleting}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <GButton 
                    title="Save" 
                    onPress={handleSubmit} 
                    loading={loading}
                  />
                </View>
              </View>
            ) : (
              <GButton 
                title="Submit" 
                onPress={handleSubmit} 
                loading={loading}
                style={styles.submitBtn}
              />
            )}
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
  formRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  animalTypeBox: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    height: 60,
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  animalValue: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  inputBox: {
    flex: 1,
  },
  note: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 18,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: SPACING.lg,
  },
  noteBold: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  halfWidth: {
    width: '48%',
  },
  submitBtn: {
    borderRadius: 8,
    height: 52,
  },
});

export default AddBreedScreen;
