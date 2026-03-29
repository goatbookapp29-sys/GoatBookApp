import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { StyleSheet, View, Text, ScrollView, Image, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { SPACING } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { getStyles } from './AddAnimalScreen.styles';
import GHeader from '../components/GHeader';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import GSelect from '../components/GSelect';
import GDatePicker from '../components/GDatePicker';
import { 
  Check, HelpCircle, ChevronDown, ChevronUp, ChevronLeft, Plus, Scale, Syringe, 
  Heart, Baby, Milk, Shield, Camera, Trash2, Edit2
} from 'lucide-react-native';
import api from '../api';
import { getFromCache } from '../utils/cache';

const AddAnimalScreen = ({ navigation, route }) => {
  const { isDarkMode, theme } = useTheme();
  const styles = useMemo(() => getStyles(theme, isDarkMode), [theme, isDarkMode]);

  const CheckBox = ({ label, value, onToggle }) => {
    return (
      <TouchableOpacity style={styles.checkboxContainer} onPress={onToggle} activeOpacity={0.7}>
        <View style={[styles.checkbox, { borderColor: theme.colors.border }, value && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}>
          {value && <Check size={14} color="#FFF" />}
        </View>
        <Text style={[styles.checkboxLabel, { color: theme.colors.text }]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const isEditing = !!route.params?.animal;
  const existingAnimal = route.params?.animal || {};
  const [weightExpanded, setWeightExpanded] = useState(false);
  const [photoExpanded, setPhotoExpanded] = useState(true);
  const [image, setImage] = useState(existingAnimal.imageUrl || null);
  const [uploading, setUploading] = useState(false);

  const [tagNumber, setTagNumber] = useState(existingAnimal.tagNumber || '');
  const [weights, setWeights] = useState([]);
  const [weightsLoading, setWeightsLoading] = useState(false);
  const [vaccinations, setVaccinations] = useState([]);
  const [vaccinationsLoading, setVaccinationsLoading] = useState(false);
  const [vaccinationExpanded, setVaccinationExpanded] = useState(false);
  const [breedId, setBreedId] = useState(existingAnimal.breedId || '');
  const [color, setColor] = useState(existingAnimal.color || '');
  const [gender, setGender] = useState(existingAnimal.gender || '');
  const [batchNo, setBatchNo] = useState(existingAnimal.batchNo || '');
  const [acquisitionMethod, setAcquisitionMethod] = useState(existingAnimal.acquisitionMethod || '');
  const [locationId, setLocationId] = useState(existingAnimal.locationId || null);
  
  const [matingExpanded, setMatingExpanded] = useState(false);
  const [breedingExpanded, setBreedingExpanded] = useState(false);
  const [milkExpanded, setMilkExpanded] = useState(false);
  const [insuranceExpanded, setInsuranceExpanded] = useState(false);
  
  // Age and Parents
  const [birthDate, setBirthDate] = useState(existingAnimal.birthDate || '');
  const [birthWeight, setBirthWeight] = useState(existingAnimal.birthWeight?.toString() || '');
  const [ageInMonths, setAgeInMonths] = useState(existingAnimal.ageInMonths?.toString() || '');
  const [birthType, setBirthType] = useState(existingAnimal.birthType || '');
  const [motherTagId, setMotherTagId] = useState(existingAnimal.motherTagId || '');
  const [fatherTagId, setFatherTagId] = useState(existingAnimal.fatherTagId || '');
  
  // Male specific
  const [isBreeder, setIsBreeder] = useState(existingAnimal.isBreeder || false);
  const [isQurbani, setIsQurbani] = useState(existingAnimal.isQurbani || false);

  // Purchased specific
  const [purchaseDate, setPurchaseDate] = useState(existingAnimal.purchaseDate || '');
  const [purchasePrice, setPurchasePrice] = useState(existingAnimal.purchasePrice?.toString() || '');
  const [femaleCondition, setFemaleCondition] = useState(existingAnimal.femaleCondition || 'NONE');

  // Misc
  const [remark, setRemark] = useState(existingAnimal.remark || '');
  const [status, setStatus] = useState(existingAnimal.status || 'Live');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isReadyForSale, setIsReadyForSale] = useState(existingAnimal.isReadyForSale || false);
  const [currentWeight, setCurrentWeight] = useState(existingAnimal.currentWeight?.toString() || '');
  const [salePrice, setSalePrice] = useState(existingAnimal.salePrice?.toString() || '');
  const [deathDate, setDeathDate] = useState(existingAnimal.deathDate || '');
  const [deathReason, setDeathReason] = useState(existingAnimal.deathReason || '');
  const [soldDate, setSoldDate] = useState(existingAnimal.soldAt || '');
  const [sellingPrice, setSellingPrice] = useState(existingAnimal.salePrice?.toString() || '');
  const [soldRemark, setSoldRemark] = useState(existingAnimal.soldRemark || '');

  // UI state
  const [breeds, setBreeds] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeadHelp, setShowDeadHelp] = useState(false);
  const [showSoldHelp, setShowSoldHelp] = useState(false);

  const [showTagHelp, setShowTagHelp] = useState(false);
  const [showShedHelp, setShowShedHelp] = useState(false);
  const [helpInfo, setHelpInfo] = useState({ visible: false, title: '', content: '' });

  const showHelp = (title, content) => {
    setHelpInfo({ visible: true, title, content });
  };

  useFocusEffect(
    useCallback(() => {
      fetchBreeds();
      fetchLocations();
        if (isEditing) {
          fetchWeights();
          fetchVaccinations();
        }
    }, [])
  );

  const fetchVaccinations = async () => {
    try {
      setVaccinationsLoading(true);
      const response = await api.get(`/vaccines/records?animalId=${existingAnimal.id}`);
      setVaccinations(response.data);
    } catch (error) {
      console.error('Fetch vaccinations error:', error);
    } finally {
      setVaccinationsLoading(false);
    }
  };

  const fetchWeights = async () => {
    try {
      setWeightsLoading(true);
      const response = await api.get(`/weights?animalId=${existingAnimal.id}`);
      setWeights(response.data);
    } catch (error) {
      console.error('Fetch weights error:', error);
    } finally {
      setWeightsLoading(false);
    }
  };

  // Rules: Uncheck male specific boxes if gender changes to FEMALE
  useEffect(() => {
    if (gender === 'FEMALE') {
      setIsBreeder(false);
      setIsQurbani(false);
    }
  }, [gender]);

  // Rules: Reset specific fields when method changes
  useEffect(() => {
    if (acquisitionMethod === 'BORN') {
      setPurchaseDate('');
      setPurchasePrice('');
      setFemaleCondition('NONE');
    } else {
      setMotherTagId('');
      setFatherTagId('');
    }
  }, [acquisitionMethod]);

  // Calculate age when birth date changes
  useEffect(() => {
    if (birthDate && birthDate !== '') {
      const birth = new Date(birthDate);
      if (!isNaN(birth.getTime())) {
        const now = new Date();
        let months = (now.getFullYear() - birth.getFullYear()) * 12;
        months -= birth.getMonth();
        months += now.getMonth();
        if (months < 0) months = 0;
        setAgeInMonths(months.toString());
      } else {
        setAgeInMonths('');
      }
    }
  }, [birthDate]);

  const fetchBreeds = async () => {
    try {
      const response = await api.get('/breeds');
      setBreeds(response.data.map(b => ({ label: `${b.name} (${b.animalType})`, value: b.id, animalType: b.animalType })));
    } catch (error) {
      console.warn('Fetch breeds failed, trying cache...', error);
      const cached = await getFromCache('breeds');
      if (cached) {
        setBreeds(cached.map(b => ({ label: `${b.name} (${b.animalType})`, value: b.id, animalType: b.animalType })));
      }
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await api.get('/locations');
      const transformed = response.data.map(loc => ({ 
        label: loc.displayName || loc.name, 
        value: loc.id 
      }));
      setLocations([{ label: 'No Location Assigned', value: null }, ...transformed]);
    } catch (error) {
      console.warn('Fetch locations failed, trying cache...', error);
      const cached = await getFromCache('locations');
      if (cached) {
        const transformed = cached.map(loc => ({ 
          label: loc.displayName || loc.name, 
          value: loc.id 
        }));
        setLocations([{ label: 'No Location Assigned', value: null }, ...transformed]);
      }
    }
  };

  const toggleBreeder = () => {
    if (gender !== 'MALE') return;
    setIsBreeder(prev => {
      if (!prev) setIsQurbani(false);
      return !prev;
    });
  };

  const toggleQurbani = () => {
    if (gender !== 'MALE') return;
    setIsQurbani(prev => {
      if (!prev) setIsBreeder(false);
      return !prev;
    });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
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
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadToCloudinary = async (imageUri) => {
    if (!imageUri || imageUri.startsWith('http')) return imageUri;

    try {
      setUploading(true);
      
      const blobResponse = await fetch(imageUri);
      const blob = await blobResponse.blob();

      const data = new FormData();
      data.append('upload_preset', 'goatbook_preset'); 
      data.append('cloud_name', 'dvtfv9vvr'); 
      data.append('file', blob, 'upload.jpg');

      const response = await fetch('https://api.cloudinary.com/v1_1/dvtfv9vvr/image/upload', {
        method: 'POST',
        body: data,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cloudinary Upload Failed:', errorText);
        throw new Error('Cloudinary Upload Failed');
      }

      const resData = await response.json();
      setUploading(false);
      return resData.secure_url;
    } catch (error) {
      setUploading(false);
      console.error('Upload to Cloudinary error:', error);
      Alert.alert('Upload Error', 'Failed to upload image to Cloudinary. Please check your connection.');
      throw error;
    }
  };

  const handleSave = async () => {
    if (!tagNumber || !breedId || !gender || !acquisitionMethod) {
      alert('Please fill in all required fields marked with *');
      return;
    }

    if (acquisitionMethod === 'PURCHASED') {
      if (!purchaseDate || !purchasePrice || !ageInMonths) {
        alert('Purchase date, price, and age in months are required for purchased animals.');
        return;
      }
    }

    const isValidDate = (d) => {
      if (!d || d === '' || d === 'Invalid Date' || d === 'Invalid date') return false;
      const date = new Date(d);
      return !isNaN(date.getTime());
    };

    setLoading(true);
    try {
      let uploadedImageUrl = image;
      if (image && !image.startsWith('http')) {
        uploadedImageUrl = await uploadToCloudinary(image);
      }

      const payload = { 
        tagNumber, 
        breedId, 
        gender, 
        color,
        batchNo,
        acquisitionMethod,
        locationId,
        imageUrl: uploadedImageUrl,
        status: status,
        birthDate: isValidDate(birthDate) ? birthDate : null,
        birthWeight: (birthWeight && !isNaN(parseFloat(birthWeight))) ? parseFloat(birthWeight) : null,
        ageInMonths: (ageInMonths && !isNaN(parseInt(ageInMonths))) ? parseInt(ageInMonths) : null,
        birthType: birthType || null,
        motherTagId: acquisitionMethod === 'BORN' ? (motherTagId || null) : null,
        fatherTagId: acquisitionMethod === 'BORN' ? (fatherTagId || null) : null,
        isBreeder: gender === 'MALE' ? isBreeder : false,
        isQurbani: gender === 'MALE' ? isQurbani : false,
        purchaseDate: (acquisitionMethod === 'PURCHASED' && isValidDate(purchaseDate)) ? purchaseDate : null,
        purchasePrice: (purchasePrice && !isNaN(parseFloat(purchasePrice))) ? parseFloat(purchasePrice) : null,
        femaleCondition: (gender === 'FEMALE' && acquisitionMethod === 'PURCHASED') ? femaleCondition : null,
        remark,
        isReadyForSale,
        currentWeight: isReadyForSale ? (parseFloat(currentWeight) || null) : null,
        salePrice: isReadyForSale ? (parseFloat(salePrice) || null) : null,
        deathDate: status === 'Dead' ? deathDate : null,
        deathReason: status === 'Dead' ? deathReason : null,
        soldAt: status === 'Sold' ? soldDate : null,
        soldRemark: status === 'Sold' ? soldRemark : null,
        salePrice: status === 'Sold' ? (parseFloat(sellingPrice) || null) : (isReadyForSale ? (parseFloat(salePrice) || null) : null),
      };

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
      'Are you sure you want to delete this animal?',
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
              navigation.navigate('AnimalList');
            } catch (error) {
              setDeleting(false);
              const msg = error.response?.data?.message || 'Failed to delete animal';
              alert(msg);
            }
          } 
        }
      ]
    );
  };

  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'live': return '#4CAF50';
      case 'sold': return '#2196F3';
      case 'dead': return '#F44336';
      default: return '#4CAF50';
    }
  };

  const sectionHeaderStyle = [
    styles.sectionTitle, 
    { 
      color: theme.colors.primary, 
      fontFamily: 'Montserrat_600SemiBold',
      letterSpacing: 0.5,
      fontSize: 15,
      marginBottom: 20,
      marginTop: 32,
      borderBottomWidth: 1.5,
      borderBottomColor: theme.colors.border,
      paddingBottom: 8,
      paddingHorizontal: 4,
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={theme.colors.primary} translucent={true} />
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <TouchableOpacity 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}
          activeOpacity={1}
          onPress={() => setShowStatusModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Status</Text>
            {['Live', 'Sold', 'Dead'].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.statusOption, status === s && { backgroundColor: isDarkMode ? '#1A1A1A' : '#F9F9F9' }]}
                onPress={() => {
                  setStatus(s);
                  setShowStatusModal(false);
                }}
              >
                <Text style={{ 
                  fontSize: 16, 
                  fontFamily: status === s ? 'Montserrat_600SemiBold' : 'Montserrat_500Medium',
                  color: status === s ? theme.colors.primary : theme.colors.text
                }}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Dead Record Help Modal */}
      <Modal
        visible={showDeadHelp}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeadHelp(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowDeadHelp(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>About Death Records</Text>
            <Text style={[styles.modalOptionText, { textAlign: 'left', marginBottom: 20, lineHeight: 20, opacity: 0.8 }]}>
              Marking an animal as 'Dead' helps you maintain a complete history of your livestock. 
              By recording the date and specific cause, you can better monitor health trends and improve farm management practices over time.
            </Text>
            <TouchableOpacity 
              style={[styles.statusOption, { borderBottomWidth: 0, justifyContent: 'center' }]} 
              onPress={() => setShowDeadHelp(false)}
            >
              <Text style={[styles.modalOptionText, { color: theme.colors.primary, fontFamily: 'Montserrat_600SemiBold' }]}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sold Record Help Modal */}
      <Modal
        visible={showSoldHelp}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSoldHelp(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowSoldHelp(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sale Information</Text>
            <Text style={[styles.modalOptionText, { textAlign: 'left', marginBottom: 20, lineHeight: 20, opacity: 0.8 }]}>
              Use this section to finalize an animal's record once sold. 
              Tracking the exact sale date and price is vital for accurate financial reporting and analyzing your farm's profitability.
            </Text>
            <TouchableOpacity 
              style={[styles.statusOption, { borderBottomWidth: 0, justifyContent: 'center' }]} 
              onPress={() => setShowSoldHelp(false)}
            >
              <Text style={[styles.modalOptionText, { color: theme.colors.primary, fontFamily: 'Montserrat_600SemiBold' }]}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Tag ID Help Modal */}
      <Modal
        visible={showTagHelp}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTagHelp(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowTagHelp(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Identification Tag ID</Text>
            <Text style={[styles.modalOptionText, { textAlign: 'left', marginBottom: 20, lineHeight: 20, opacity: 0.8 }]}>
              A Tag ID is an essential identifier for every animal. It can be a simple number or a scannable barcode found on the animal's ear tag. 
              Maintaining unique IDs ensures that health, weight, and breeding records are always linked to the correct animal for accurate history tracking and farm management.
            </Text>
            <TouchableOpacity 
              style={[styles.statusOption, { borderBottomWidth: 0, justifyContent: 'center' }]} 
              onPress={() => setShowTagHelp(false)}
            >
              <Text style={[styles.modalOptionText, { color: theme.colors.primary, fontFamily: 'Montserrat_600SemiBold' }]}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Reusable Record Help Modal */}
      <Modal
        visible={helpInfo.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setHelpInfo({ ...helpInfo, visible: false })}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setHelpInfo({ ...helpInfo, visible: false })}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{helpInfo.title}</Text>
            <Text style={[styles.modalOptionText, { textAlign: 'left', marginBottom: 20, lineHeight: 20, opacity: 0.8 }]}>
              {helpInfo.content}
            </Text>
            <TouchableOpacity 
              style={[styles.statusOption, { borderBottomWidth: 0, justifyContent: 'center' }]} 
              onPress={() => setHelpInfo({ ...helpInfo, visible: false })}
            >
              <Text style={[styles.modalOptionText, { color: theme.colors.primary, fontFamily: 'Montserrat_600SemiBold' }]}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Shed Help Modal */}
      <Modal
        visible={showShedHelp}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowShedHelp(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowShedHelp(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>What is Shed Name/ No?</Text>
            <Text style={[styles.modalOptionText, { textAlign: 'left', marginBottom: 20, lineHeight: 20, opacity: 0.8 }]}>
              This is the specific area, zone, or compartment of your farm where this animal is primarily kept. 
              Assigning animals to sheds helps in tracking feed consumption, disease control, and space management.
            </Text>
            <TouchableOpacity 
              style={[styles.statusOption, { borderBottomWidth: 0, justifyContent: 'center' }]} 
              onPress={() => setShowShedHelp(false)}
            >
              <Text style={[styles.modalOptionText, { color: theme.colors.primary, fontFamily: 'Montserrat_600SemiBold' }]}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeft color="#FFF" size={28} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{isEditing ? 'Edit Animal' : 'Add Animal'}</Text>
          <TouchableOpacity style={styles.statusContainer} onPress={() => setShowStatusModal(true)}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={styles.statusText}>{status.charAt(0) + status.slice(1).toLowerCase()}</Text>
            <ChevronDown color="#FFF" size={14} strokeWidth={3} style={styles.statusChevron} />
          </TouchableOpacity>
        </View>
      </View>
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={[styles.photoCard, { borderColor: theme.colors.border }]}>
            <TouchableOpacity 
              style={styles.photoHeader} 
              activeOpacity={0.7}
              onPress={() => setPhotoExpanded(!photoExpanded)}
            >
              <View style={styles.iconGroup}>
                <Text style={[styles.photoTitle, { color: theme.colors.text, fontFamily: 'Montserrat_600SemiBold' }]}>Add Photo</Text>
                <Camera size={20} color={theme.colors.primary} style={{ marginLeft: 8 }} />
              </View>
              {photoExpanded ? <ChevronUp size={20} color={theme.colors.textMuted} /> : <ChevronDown size={20} color={theme.colors.textMuted} />}
            </TouchableOpacity>

            {photoExpanded && (
              <View style={styles.photoContent}>
                {image ? (
                  <View style={{ width: '100%', position: 'relative' }}>
                    <Image source={{ uri: image }} style={styles.imagePreview} />
                    {uploading && (
                      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', borderRadius: 12 }]}>
                        <ActivityIndicator color="#FFF" size="large" />
                      </View>
                    )}
                    <View style={styles.imageActions}>
                      <TouchableOpacity style={styles.imageActionBtn} onPress={takePhoto}>
                        <Edit2 size={18} color="#FFF" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.imageActionBtn} onPress={() => setImage(null)}>
                        <Trash2 size={18} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.row}>
                    <TouchableOpacity 
                      style={[styles.photoPlaceholder, { borderColor: theme.colors.border, flex: 1, marginRight: 8 }]}
                      onPress={takePhoto}
                    >
                      <Camera size={24} color={theme.colors.textMuted} />
                      <Text style={{ color: theme.colors.textMuted, marginTop: 4, fontSize: 12 }}>Camera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.photoPlaceholder, { borderColor: theme.colors.border, flex: 1 }]}
                      onPress={pickImage}
                    >
                      <Plus size={24} color={theme.colors.textMuted} />
                      <Text style={{ color: theme.colors.textMuted, marginTop: 4, fontSize: 12 }}>Import</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
          {isEditing && status === 'Live' && (
            <View style={styles.readyToSellCard}>
               <View style={styles.readyHeaderRow}>
                  <Text style={[styles.readyTitle, { color: theme.colors.error, fontFamily: 'Montserrat_600SemiBold' }]}>Ready to Sell</Text>
                  <HelpCircle size={18} color={theme.colors.textMuted} />
               </View>
               <View style={styles.readyOptions}>
                  <CheckBox label="No" value={!isReadyForSale} onToggle={() => setIsReadyForSale(false)} />
                  <View style={{ width: 24 }} />
                  <CheckBox label="Yes" value={isReadyForSale} onToggle={() => setIsReadyForSale(true)} />
               </View>
            </View>
          )}

          {status === 'Dead' && (
            <View style={styles.readyToSellCard}>
               <View style={styles.readyHeaderRow}>
                  <Text style={[styles.readyTitle, { color: theme.colors.primary, fontFamily: 'Montserrat_600SemiBold' }]}>Dead Record</Text>
                  <TouchableOpacity onPress={() => setShowDeadHelp(true)}>
                    <HelpCircle size={18} color={theme.colors.textMuted} />
                  </TouchableOpacity>
               </View>
               <View style={styles.formContainer}>
                  <GDatePicker 
                    label="Date*" 
                    value={deathDate} 
                    onDateChange={setDeathDate} 
                    containerStyle={{ marginBottom: 12 }}
                  />
                  <GInput 
                    label="Reason" 
                    placeholder="Reason" 
                    value={deathReason} 
                    onChangeText={setDeathReason} 
                  />
               </View>
            </View>
          )}

          {status === 'Sold' && (
            <View style={styles.readyToSellCard}>
               <View style={styles.readyHeaderRow}>
                  <Text style={[styles.readyTitle, { color: theme.colors.primary, fontFamily: 'Montserrat_600SemiBold' }]}>Sold Record</Text>
                  <TouchableOpacity onPress={() => setShowSoldHelp(true)}>
                    <HelpCircle size={18} color={theme.colors.textMuted} />
                  </TouchableOpacity>
               </View>
               <View style={styles.formContainer}>
                  <View style={styles.row}>
                    <GDatePicker 
                      label="Date*" 
                      value={soldDate} 
                      onDateChange={setSoldDate} 
                      containerStyle={{ flex: 1, marginRight: 12 }}
                    />
                    <GInput 
                      label="Sale Price (Rs.)*" 
                      placeholder="Selling Price" 
                      value={sellingPrice} 
                      onChangeText={setSellingPrice} 
                      keyboardType="numeric"
                      containerStyle={{ flex: 1 }}
                    />
                  </View>
                  <GInput 
                    label="Remark" 
                    placeholder="Remark" 
                    value={soldRemark} 
                    onChangeText={setSoldRemark} 
                  />
               </View>
            </View>
          )}

          <Text style={sectionHeaderStyle}>Identification</Text>

          <View style={styles.formContainer}>
            <View style={styles.row}>
              <GInput 
                containerStyle={styles.halfWidth}
                label="Tag ID" 
                value={tagNumber} 
                onChangeText={setTagNumber} 
                placeholder="2912"
                required 
                helpAction={() => setShowTagHelp(true)}
              />
              <GInput 
                containerStyle={styles.halfWidth}
                label="Animal Type" 
                value={breedId ? breeds.find(b => b.value === breedId)?.animalType || 'Goat' : 'Goat'} 
                editable={false}
                style={{ backgroundColor: theme.colors.surface, color: theme.colors.textMuted }}
              />
            </View>

            <View style={styles.row}>
              <GSelect 
                containerStyle={styles.halfWidth}
                label="Breed" 
                value={breedId} 
                onSelect={setBreedId}
                options={breeds}
                placeholder="Select..."
                required
              />
              <GSelect 
                containerStyle={styles.halfWidth}
                label="Gender" 
                value={gender} 
                onSelect={setGender}
                options={[
                  { label: 'Male', value: 'MALE' },
                  { label: 'Female', value: 'FEMALE' }
                ]}
                required
              />
            </View>

            {gender === 'MALE' && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12, marginLeft: 16 }}>
                <Text style={{ 
                  fontSize: 14, 
                  color: theme.colors.text, 
                  fontFamily: 'Montserrat_600SemiBold',
                  marginRight: 16,
                }}>Male Options:</Text>
                <CheckBox label="Breeder" value={isBreeder} onToggle={toggleBreeder} />
                <View style={{ width: 16 }} />
                <CheckBox label="Qurbani" value={isQurbani} onToggle={toggleQurbani} />
              </View>
            )}

            {/* ROW 3 */}
            <View style={styles.row}>
               <GInput 
                containerStyle={styles.halfWidth}
                label="Color" 
                value={color}
                onChangeText={setColor}
                placeholder="e.g. Red"
              />
              <GInput 
                containerStyle={styles.halfWidth}
                label="Batch No" 
                value={batchNo} 
                onChangeText={setBatchNo} 
                placeholder="e.g. 31"
              />
            </View>

            {/* ROW 4 */}
            <View style={styles.row}>
              <GSelect 
                containerStyle={styles.halfWidth}
                label="Source" 
                value={acquisitionMethod} 
                onSelect={setAcquisitionMethod}
                options={[
                  { label: 'Born At Farm', value: 'BORN' },
                  { label: 'Purchased', value: 'PURCHASED' }
                ]}
                required
              />
              <GSelect 
                containerStyle={styles.halfWidth}
                label="Location / Shed" 
                value={locationId} 
                onSelect={setLocationId}
                options={locations}
                placeholder="Select..."
                helpAction={() => setShowShedHelp(true)}
              />
            </View>

            {/* GROWTH SECTION: Only visible if Gender is Female OR acquisitionMethod is PURCHASED/BORN check images */}
            {((gender === 'FEMALE') || (acquisitionMethod === 'PURCHASED') || (acquisitionMethod === 'BORN')) && (
              <>
                <Text style={sectionHeaderStyle}>Growth & Background</Text>
                
                {/* Born specific fields check image 3 */}
                {acquisitionMethod === 'BORN' && (
                  <View style={styles.row}>
                    <GDatePicker 
                      containerStyle={styles.halfWidth}
                      label="Birth Date" 
                      value={birthDate} 
                      onDateChange={setBirthDate}
                      placeholder="Select Date"
                      required
                    />
                    <GInput 
                      containerStyle={styles.halfWidth}
                      label="Birth Wt." 
                      value={birthWeight} 
                      onChangeText={setBirthWeight} 
                      keyboardType="decimal-pad"
                      placeholder="e.g. 5.5"
                    />
                  </View>
                )}

                {/* AGE and BIRTH TYPE: Visible if Female or Method is set */}
                <View style={styles.row}>
                  <GInput 
                    containerStyle={styles.halfWidth}
                    label="Age (Months)" 
                    value={ageInMonths} 
                    onChangeText={setAgeInMonths} 
                    keyboardType="number-pad"
                    placeholder="e.g. 12"
                    required={(acquisitionMethod === 'PURCHASED' || gender === 'FEMALE')}
                  />
                  <GSelect 
                    containerStyle={styles.halfWidth}
                    label="Birth Type" 
                    value={birthType} 
                    onSelect={setBirthType}
                    options={[
                      { label: 'Single', value: 'SINGLE' },
                      { label: 'Twin', value: 'TWIN' },
                      { label: 'Triplet', value: 'TRIPLET' },
                      { label: 'Quadruplet', value: 'QUADRUPLET' }
                    ]}
                    placeholder="Select Type"
                  />
                </View>

                {/* PARENTS: Only if Born at farm */}
                {acquisitionMethod === 'BORN' && (
                  <View style={styles.row}>
                    <GInput 
                      containerStyle={styles.halfWidth}
                      label="Mother Tag ID" 
                      value={motherTagId}
                      onChangeText={setMotherTagId}
                      placeholder="e.g. 1974"
                    />
                    <GInput 
                      containerStyle={styles.halfWidth}
                      label="Father Tag ID" 
                      value={fatherTagId}
                      onChangeText={setFatherTagId}
                      placeholder="e.g. 1974"
                    />
                  </View>
                )}
              </>
            )}

            {/* PURCHASE SECTION */}
            {acquisitionMethod === 'PURCHASED' && (
              <>
                <View style={styles.row}>
                  <GDatePicker 
                    containerStyle={styles.halfWidth}
                    label="Purchase Date" 
                    value={purchaseDate} 
                    onDateChange={setPurchaseDate}
                    placeholder="Select Date"
                    required
                  />
                  <GInput 
                    containerStyle={styles.halfWidth}
                    label="Purchase Price" 
                    value={purchasePrice} 
                    onChangeText={setPurchasePrice} 
                    keyboardType="number-pad"
                    placeholder="e.g. 5000"
                    required
                  />
                </View>
                {gender === 'FEMALE' && (
                  <View style={styles.row}>
                    <GSelect 
                      containerStyle={styles.halfWidth}
                      label="Female Cond." 
                      value={femaleCondition} 
                      onSelect={setFemaleCondition}
                      options={[
                        { label: 'None', value: 'NONE' },
                        { label: 'Mated', value: 'MATED' },
                        { label: 'Pregnant', value: 'PREGNANT' }
                      ]}
                    />
                    <View style={styles.halfWidth} />
                  </View>
                )}
              </>
            )}

            <GInput 
              label="Remark" 
              value={remark} 
              onChangeText={setRemark} 
              placeholder="e.g. Good!"
              multiline
              style={{ minHeight: 80, paddingTop: 12, color: theme.colors.text }}
            />
          </View>

          {isEditing && (
            <View style={[styles.weightSection, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <TouchableOpacity 
                style={[styles.weightHeader, { borderBottomColor: theme.colors.border }]}
                activeOpacity={0.7}
                onPress={() => setWeightExpanded(!weightExpanded)}
              >
                <View style={[styles.row, { marginBottom: 0, alignItems: 'center' }]}>
                  <Text style={[sectionHeaderStyle, { marginBottom: 0, marginTop: 0, borderBottomWidth: 0, paddingBottom: 0 }]}>Weight History</Text>
                  <TouchableOpacity onPress={() => showHelp('What is Weight Record?', 'This section allows you to maintain weight of animal that you measure periodically. This will help you to analyze weight gain chart.')}>
                    <HelpCircle size={14} color={theme.colors.textMuted} style={{ marginLeft: 6, marginTop: -1 }} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
                {weightExpanded ? <ChevronUp size={20} color={theme.colors.textMuted} /> : <ChevronDown size={20} color={theme.colors.textMuted} />}
              </TouchableOpacity>
              
              {weightExpanded && (
                <View style={styles.weightContent}>
                  {weightsLoading ? (
                    <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: 20 }} />
                  ) : weights.length > 0 ? (
                    <>
                      <TouchableOpacity 
                        style={styles.addNewBtn}
                        onPress={() => navigation.navigate('AddWeight', { tagNumber: existingAnimal.tagNumber })}
                      >
                        <Plus size={16} color="#FFF" />
                        <Text style={styles.addNewText}>Add New Record</Text>
                      </TouchableOpacity>
                      <View style={styles.weightList}>
                        {weights.map((w, idx) => (
                          <View key={w.id} style={[styles.weightItem, { borderBottomColor: theme.colors.border }, idx === weights.length - 1 && { borderBottomWidth: 0 }]}>
                            <View style={[styles.weightIconBox, { backgroundColor: isDarkMode ? theme.colors.surface : '#FFF1EA' }]}>
                              <Scale size={16} color={theme.colors.primary} />
                            </View>
                            <View style={styles.weightInfoBlock}>
                              <Text style={[styles.weightKg, { color: theme.colors.text }]}>{w.weight} KG</Text>
                              <Text style={[styles.weightDate, { color: theme.colors.textLight }]}>{w.date}</Text>
                            </View>
                            {w.height && (
                              <View style={styles.heightInfoBlock}>
                                <Text style={[styles.weightLabel, { color: theme.colors.textLight }]}>Height</Text>
                                <Text style={[styles.weightValue, { color: theme.colors.text }]}>{w.height}</Text>
                              </View>
                            )}
                          </View>
                        ))}
                      </View>
                    </>
                  ) : (
                    <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                      <Text style={[styles.noRecordsText, { color: theme.colors.textMuted, marginBottom: 12, marginTop: 0 }]}>No records found</Text>
                      <TouchableOpacity 
                        style={[styles.addNewBtn, { alignSelf: 'center', marginBottom: 0 }]}
                        onPress={() => navigation.navigate('AddWeight', { tagNumber: existingAnimal.tagNumber })}
                      >
                        <Plus size={16} color="#FFF" />
                        <Text style={styles.addNewText}>Add New Record</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {isEditing && (
            <>
              {/* VACCINATION RECORD */}
              <View style={[styles.weightSection, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <TouchableOpacity 
                  style={[styles.weightHeader, { borderBottomColor: theme.colors.border }]}
                  activeOpacity={0.7}
                  onPress={() => setVaccinationExpanded(!vaccinationExpanded)}
                >
                <View style={[styles.row, { marginBottom: 0, alignItems: 'center' }]}>
                  <Text style={[sectionHeaderStyle, { marginBottom: 0, marginTop: 0, borderBottomWidth: 0, paddingBottom: 0 }]}>Vaccination Record</Text>
                  <TouchableOpacity onPress={() => showHelp('What is Vaccination Record?', 'This section allows you to maintain each vaccination given to the animal. You can specify vaccination date, vaccination name and other detail like Dr. Name or dose, etc.')}>
                    <HelpCircle size={14} color={theme.colors.textMuted} style={{ marginLeft: 6, marginTop: -1 }} strokeWidth={2} />
                  </TouchableOpacity>
                </View>
                {vaccinationExpanded ? <ChevronUp size={20} color={theme.colors.textMuted} /> : <ChevronDown size={20} color={theme.colors.textMuted} />}
              </TouchableOpacity>
                {vaccinationExpanded && (
                  <View style={styles.weightContent}>
                    {vaccinationsLoading ? (
                      <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: 20 }} />
                    ) : vaccinations.length > 0 ? (
                      <>
                        <TouchableOpacity 
                          style={styles.addNewBtn}
                          onPress={() => navigation.navigate('AddVaccination', { mode: 'single', preSelectedAnimal: existingAnimal })}
                        >
                          <Plus size={16} color="#FFF" />
                          <Text style={styles.addNewText}>Add New Record</Text>
                        </TouchableOpacity>
                        <View style={styles.weightList}>
                          {vaccinations.map((v, idx) => (
                            <TouchableOpacity 
                              key={v.id} 
                              style={[styles.weightItem, { borderBottomColor: theme.colors.border }, idx === vaccinations.length - 1 && { borderBottomWidth: 0 }]}
                              onPress={() => navigation.navigate('AddVaccination', { mode: 'single', record: v })}
                            >
                              <View style={styles.weightIconBox}>
                                <Syringe size={16} color={theme.colors.primary} />
                              </View>
                              <View style={styles.weightInfoBlock}>
                                <Text style={[styles.weightKg, { color: theme.colors.text }]}>{v.vaccine?.name}</Text>
                                <Text style={[styles.weightDate, { color: theme.colors.textLight }]}>{v.date}</Text>
                              </View>
                              {v.nextDueDate && (
                                <View style={[styles.heightInfoBlock, { minWidth: 100 }]}>
                                  <Text style={[styles.weightLabel, { color: theme.colors.primary, fontFamily: theme.typography.medium }]}>Due Date</Text>
                                  <Text style={[styles.weightValue, { color: theme.colors.text, fontFamily: theme.typography.semiBold }]}>{v.nextDueDate}</Text>
                                </View>
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      </>
                    ) : (
                      <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                        <Text style={[styles.noRecordsText, { color: theme.colors.textMuted, marginBottom: 12, marginTop: 0 }]}>No records found</Text>
                        <TouchableOpacity 
                          style={[styles.addNewBtn, { alignSelf: 'center', marginBottom: 0 }]}
                          onPress={() => navigation.navigate('AddVaccination', { mode: 'single', preSelectedAnimal: existingAnimal })}
                        >
                          <Plus size={16} color="#FFF" />
                          <Text style={styles.addNewText}>Add New Record</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>



              {/* MATING RECORD */}
              <View style={[styles.weightSection, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <TouchableOpacity 
                  style={[styles.weightHeader, { borderBottomColor: theme.colors.border }]}
                  activeOpacity={0.7}
                  onPress={() => setMatingExpanded(!matingExpanded)}
                >
                  <View style={[styles.row, { marginBottom: 0, alignItems: 'center' }]}>
                    <Text style={[sectionHeaderStyle, { marginBottom: 0, marginTop: 0, borderBottomWidth: 0, paddingBottom: 0 }]}>Mating Record</Text>
                    <TouchableOpacity onPress={() => showHelp('What is Mating Record?', 'This section allows you to maintain mating details of animal. This will help you to analyze when goat expected to become pregnant and delivered kids.')}>
                      <HelpCircle size={14} color={theme.colors.textMuted} style={{ marginLeft: 6, marginTop: -1 }} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                  {matingExpanded ? <ChevronUp size={20} color={theme.colors.textMuted} /> : <ChevronDown size={20} color={theme.colors.textMuted} />}
                </TouchableOpacity>
                  {matingExpanded && (
                    <View style={styles.weightContent}>
                      <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                        <Text style={[styles.noRecordsText, { color: theme.colors.textMuted, marginBottom: 16, marginTop: 0 }]}>No records found</Text>
                        <TouchableOpacity 
                          style={[styles.addNewBtn, { alignSelf: 'center', marginBottom: 0 }]}
                          onPress={() => {}}
                        >
                          <Plus size={16} color="#FFF" />
                          <Text style={styles.addNewText}>Add New Record</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
              </View>

              {/* BREEDING/DELIVERY */}
              <View style={[styles.weightSection, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <TouchableOpacity 
                  style={[styles.weightHeader, { borderBottomColor: theme.colors.border }]}
                  activeOpacity={0.7}
                  onPress={() => setBreedingExpanded(!breedingExpanded)}
                >
                  <View style={[styles.row, { marginBottom: 0, alignItems: 'center' }]}>
                    <Text style={[sectionHeaderStyle, { marginBottom: 0, marginTop: 0, borderBottomWidth: 0, paddingBottom: 0 }]}>Breeding/Delivery Record</Text>
                    <TouchableOpacity onPress={() => showHelp('What Is Breeding Record?', 'This section allow you to maintain each breeding record of individual goat.You can specify delivery date, birth type and also provid temporary tag id to the litters/kids and other detail like gender, birth weight, etc.')}>
                      <HelpCircle size={14} color={theme.colors.textMuted} style={{ marginLeft: 6, marginTop: -1 }} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                  {breedingExpanded ? <ChevronUp size={20} color={theme.colors.textMuted} /> : <ChevronDown size={20} color={theme.colors.textMuted} />}
                </TouchableOpacity>
                  {breedingExpanded && (
                    <View style={styles.weightContent}>
                      <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                        <Text style={[styles.noRecordsText, { color: theme.colors.textMuted, marginBottom: 16, marginTop: 0 }]}>No records found</Text>
                        <TouchableOpacity 
                          style={[styles.addNewBtn, { alignSelf: 'center', marginBottom: 0 }]}
                          onPress={() => {}}
                        >
                          <Plus size={16} color="#FFF" />
                          <Text style={styles.addNewText}>Add New Record</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
              </View>

              {/* MILK HISTORY */}
              <View style={[styles.weightSection, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <TouchableOpacity 
                  style={[styles.weightHeader, { borderBottomColor: theme.colors.border }]}
                  activeOpacity={0.7}
                  onPress={() => setMilkExpanded(!milkExpanded)}
                >
                  <View style={[styles.row, { marginBottom: 0, alignItems: 'center' }]}>
                    <Text style={[sectionHeaderStyle, { marginBottom: 0, marginTop: 0, borderBottomWidth: 0, paddingBottom: 0 }]}>Milk History</Text>
                    <TouchableOpacity onPress={() => showHelp('What is Milk History?', 'Track daily or periodic milk production of your female goats. This helps in identifying high-yielding animals and monitoring lactation cycles.')}>
                      <HelpCircle size={14} color={theme.colors.textMuted} style={{ marginLeft: 6, marginTop: -1 }} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                  {milkExpanded ? <ChevronUp size={20} color={theme.colors.textMuted} /> : <ChevronDown size={20} color={theme.colors.textMuted} />}
                </TouchableOpacity>
                  {milkExpanded && (
                    <View style={styles.weightContent}>
                      <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                        <Text style={[styles.noRecordsText, { color: theme.colors.textMuted, marginBottom: 16, marginTop: 0 }]}>No records found</Text>
                        <TouchableOpacity 
                          style={[styles.addNewBtn, { alignSelf: 'center', marginBottom: 0 }]}
                          onPress={() => {}}
                        >
                          <Plus size={16} color="#FFF" />
                          <Text style={styles.addNewText}>Add New Record</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
              </View>

              {/* INSURANCE */}
              <View style={[styles.weightSection, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                <TouchableOpacity 
                  style={[styles.weightHeader, { borderBottomColor: theme.colors.border }]}
                  activeOpacity={0.7}
                  onPress={() => setInsuranceExpanded(!insuranceExpanded)}
                >
                  <View style={[styles.row, { marginBottom: 0, alignItems: 'center' }]}>
                    <Text style={[sectionHeaderStyle, { marginBottom: 0, marginTop: 0, borderBottomWidth: 0, paddingBottom: 0 }]}>Insurance</Text>
                    <TouchableOpacity onPress={() => showHelp('What is Insurance?', 'Store insurance details for your livestock, including company name, policy number, and coverage period, ensuring your farm assets are well-protected.')}>
                      <HelpCircle size={14} color={theme.colors.textMuted} style={{ marginLeft: 6, marginTop: -1 }} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                  {insuranceExpanded ? <ChevronUp size={20} color={theme.colors.textMuted} /> : <ChevronDown size={20} color={theme.colors.textMuted} />}
                </TouchableOpacity>
                {insuranceExpanded && (
                  <View style={[styles.weightContent, { paddingHorizontal: 4 }]}>
                    <GInput label="Insurance Company" placeholder="Insurance Company" />
                    <GInput label="Plan Name" placeholder="Plan Name" />
                    <GInput label="Policy Number" placeholder="Policy Number" />
                    <GInput label="Agent Name" placeholder="Agent Name" />
                  </View>
                )}
              </View>
            </>
          )}

          <View style={styles.footer}>
            {isEditing ? (
              <View style={styles.buttonRow}>
                <View style={[styles.halfBtn, { marginRight: 8 }]}>
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
                title="Create Animal Record" 
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

export default AddAnimalScreen;
