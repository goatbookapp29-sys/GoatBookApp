import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { COLORS, SPACING } from '../theme';
import GHeader from '../components/GHeader';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import GSelect from '../components/GSelect';
import api from '../api';

const AddBreedScreen = ({ navigation, route }) => {
  const isEditing = !!route.params?.breed;
  const existingBreed = route.params?.breed;

  const [name, setName] = useState(isEditing ? existingBreed.name : '');
  const [animalType, setAnimalType] = useState(isEditing ? existingBreed.animalType : 'Goat');
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
        await api.put(`/breeds/${existingBreed.id}`, { name, animalType });
      } else {
        await api.post('/breeds', { name, animalType });
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
        title={isEditing ? "Edit Breed" : "Add New Breed"} 
        onBack={() => navigation.goBack()} 
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formSection}>
            <GSelect 
              label="Animal Type" 
              value={animalType} 
              onSelect={setAnimalType}
              options={[
                { label: 'Goat', value: 'Goat' },
                { label: 'Sheep', value: 'Sheep' },
                { label: 'Other', value: 'Other' }
              ]}
              required
            />
            
            <View style={styles.gap} />
            
            <GInput 
              label="Breed Name" 
              value={name} 
              onChangeText={setName} 
              placeholder="e.g. Boer, Sirohi, Khassi"
              required 
            />
          </View>

          <Text style={styles.note}>
            <Text style={styles.noteBold}>Note : </Text>
            Manage your livestock breeds. You can specify whether a breed belongs to Goats or Sheep. 
          </Text>

          <View style={styles.footer}>
            {isEditing ? (
              <View style={styles.buttonRow}>
                <View style={[styles.halfWidth, { marginRight: 8 }]}>
                  <GButton 
                    title="Delete" 
                    onPress={handleDelete} 
                    variant="outline"
                    loading={deleting}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <GButton 
                    title="Save Changes" 
                    onPress={handleSubmit} 
                    loading={loading}
                  />
                </View>
              </View>
            ) : (
              <GButton 
                title="Create Breed" 
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
  formSection: {
    marginBottom: SPACING.xl,
  },
  gap: {
    height: 16,
  },
  note: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 18,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: SPACING.lg,
    marginTop: SPACING.md,
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
    flex: 1,
  },
  submitBtn: {
    borderRadius: 8,
    height: 52,
  },
});

export default AddBreedScreen;
