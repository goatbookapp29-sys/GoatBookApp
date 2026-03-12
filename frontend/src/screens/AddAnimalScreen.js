import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { COLORS, SPACING } from '../theme';
import GHeader from '../components/GHeader';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import GSelect from '../components/GSelect';
import GDatePicker from '../components/GDatePicker';
import api from '../api';

const AddAnimalScreen = ({ navigation, route }) => {
  const isEditing = !!route.params?.animal;
  const existingAnimal = route.params?.animal;

  const [tagNumber, setTagNumber] = useState(isEditing ? existingAnimal.tagNumber : '');
  const [breedId, setBreedId] = useState(isEditing ? existingAnimal.breedId : '');
  const [gender, setGender] = useState(isEditing ? existingAnimal.gender : 'FEMALE');
  const [birthDate, setBirthDate] = useState(isEditing ? existingAnimal.birthDate : '');
  
  const [breeds, setBreeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchBreeds();
  }, []);

  const fetchBreeds = async () => {
    try {
      const response = await api.get('/breeds');
      setBreeds(response.data.map(b => ({ label: `${b.name} (${b.animalType})`, value: b.id })));
    } catch (error) {
      console.error('Fetch breeds error:', error);
    }
  };

  const handleSave = async () => {
    if (!tagNumber || !breedId) {
      alert('Please fill in required fields (Tag Number and Breed)');
      return;
    }

    setLoading(true);
    try {
      const payload = { tagNumber, breedId, gender, birthDate };
      if (isEditing) {
        await api.put(`/animals/${existingAnimal.id}`, payload);
      } else {
        await api.post('/animals', payload);
      }
      setLoading(false);
      navigation.goBack();
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || 'Failed to save animal';
      alert(message);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Animal',
      'Are you sure you want to remove this animal from the farm records?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            setDeleting(true);
            try {
              await api.delete(`/animals/${existingAnimal.id}`);
              setDeleting(false);
              navigation.goBack();
            } catch (error) {
              setDeleting(false);
              alert('Failed to delete animal');
            }
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <GHeader 
        title={isEditing ? "Edit Animal" : "Add Animal"} 
        onBack={() => navigation.goBack()} 
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <GInput 
              label="Tag Number" 
              value={tagNumber} 
              onChangeText={setTagNumber} 
              placeholder="e.g. GT-001"
              required 
            />
            
            <View style={styles.gap} />
            
            <GSelect 
              label="Breed" 
              value={breedId} 
              onSelect={setBreedId}
              options={breeds}
              placeholder="Choose a breed"
              required
            />
            
            <View style={styles.gap} />
            
            <GSelect 
              label="Gender" 
              value={gender} 
              onSelect={setGender}
              options={[
                { label: 'Male (Buck/Ram)', value: 'MALE' },
                { label: 'Female (Doe/Ewe)', value: 'FEMALE' }
              ]}
              required
            />

            <View style={styles.gap} />

            <GDatePicker 
              label="Date of Birth" 
              value={birthDate} 
              onDateChange={setBirthDate}
              placeholder="Select birth date"
            />
          </View>

          <View style={styles.footer}>
            {isEditing ? (
              <View style={styles.buttonRow}>
                <View style={styles.halfBtn}>
                  <GButton 
                    title="Delete" 
                    variant="outline" 
                    onPress={handleDelete}
                    loading={deleting}
                  />
                </View>
                <View style={styles.halfBtn}>
                  <GButton 
                    title="Save Changes" 
                    onPress={handleSave}
                    loading={loading}
                  />
                </View>
              </View>
            ) : (
              <GButton 
                title="Add Animal to Farm" 
                onPress={handleSave}
                loading={loading}
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
    backgroundColor: COLORS.white,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    flexGrow: 1,
  },
  formContainer: {
    marginTop: SPACING.md,
  },
  gap: {
    height: 16,
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: SPACING.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfBtn: {
    width: '48%',
  }
});

export default AddAnimalScreen;
