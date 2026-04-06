import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import GHeader from '../components/GHeader';
import GInput from '../components/GInput';
import GButton from '../components/GButton';
import GSelect from '../components/GSelect';
import api from '../api';
import { Scan, HelpCircle, X, Tag, MapPin, Info, ArrowRightLeft } from 'lucide-react-native';
import { SPACING, SHADOW } from '../theme';

const AddLocationScreen = ({ navigation, route }) => {
  const { isDarkMode, theme } = useTheme();
  const styles = useMemo(() => getStyles(theme, isDarkMode), [theme, isDarkMode]);

  const [tagNumber, setTagNumber] = useState('');
  const [animal, setAnimal] = useState(null);
  const [locationId, setLocationId] = useState(null);
  const [newLocationName, setNewLocationName] = useState('');
  const [remark, setRemark] = useState('');
  
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await api.get('/locations');
      setLocations(response.data.map(loc => ({ 
        label: loc.displayName || loc.name, 
        value: loc.id 
      })));
    } catch (error) {
      console.error('Fetch locations error:', error);
    }
  };

  const handleSearchAnimal = async () => {
    if (!tagNumber) {
      Alert.alert('Validation', 'Please enter a Tag ID');
      return;
    }
    setSearching(true);
    try {
      const response = await api.get(`/animals/check-tag/${tagNumber}`);
      setAnimal(response.data);
      setSearching(false);
    } catch (error) {
      setSearching(false);
      setAnimal(null);
      Alert.alert('Not Found', 'Animal with this Tag ID not found in your farm.');
    }
  };

  const handleSave = async () => {
    if (!animal) {
      Alert.alert('Required', 'Please add an animal by searching its Tag ID first.');
      return;
    }

    if (!locationId && !newLocationName) {
      Alert.alert('Required', 'Please select an existing shed or enter a name for a new one.');
      return;
    }

    setLoading(true);
    try {
      let targetLocationId = locationId;

      if (newLocationName) {
        const locRes = await api.post('/locations', {
          name: newLocationName,
          code: newLocationName.toUpperCase().substring(0, 5),
          type: 'Internal Location'
        });
        targetLocationId = locRes.data.id;
      }

      await api.put(`/animals/${animal.id}`, {
        locationId: targetLocationId,
        remark: remark
      });

      setLoading(false);
      Alert.alert('Success', 'Location assigned successfully');
      navigation.goBack();
    } catch (error) {
      setLoading(false);
      const message = error.response?.data?.message || 'Failed to assign location';
      Alert.alert('Error', message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GHeader 
        title="Move Livestock" 
        onBack={() => navigation.goBack()} 
        leftAlign={true}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flex}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Tag ID Search Row - Fixed Alignment */}
          <View style={styles.searchSection}>
            <View style={styles.inputRow}>
              <View style={styles.inputFlex}>
                <GInput 
                  label="Scan/Enter Tag ID*" 
                  placeholder="e.g. 501"
                  value={tagNumber} 
                  onChangeText={(val) => {
                    setTagNumber(val);
                    if (!val) setAnimal(null);
                  }} 
                  required 
                  rightIcon={tagNumber ? (
                    <TouchableOpacity onPress={() => {setTagNumber(''); setAnimal(null);}}>
                        <X size={18} color={theme.colors.textMuted} />
                    </TouchableOpacity>
                  ) : <Scan size={20} color={theme.colors.textMuted} />}
                />
              </View>
              <TouchableOpacity 
                style={[styles.addBtn, { backgroundColor: theme.colors.primary }]}
                onPress={handleSearchAnimal}
                activeOpacity={0.8}
                disabled={searching}
              >
                <Text style={styles.addBtnText}>{searching ? '...' : 'SEARCH'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Animal Card (Premium Preview) */}
          {animal ? (
            <View style={[styles.animalCard, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.cardHeader}>
                <View style={styles.tagBadge}>
                  <Tag size={14} color="#FFF" />
                  <Text style={styles.tagText}>#{animal.tagNumber}</Text>
                </View>
                <Text style={[styles.breedText, { color: theme.colors.textLight }]}>{animal.breedName || 'Sirohi'}</Text>
              </View>
              
              <View style={styles.cardDivider} />
              
              <View style={styles.metaGrid}>
                <View style={styles.metaItem}>
                  <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>Gender</Text>
                  <Text style={[styles.metaVal, { color: theme.colors.text }]}>{animal.gender}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>Age</Text>
                  <Text style={[styles.metaVal, { color: theme.colors.text }]}>{animal.ageInMonths} Months</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={[styles.metaLabel, { color: theme.colors.textMuted }]}>Current Shed</Text>
                  <View style={styles.locRow}>
                    <MapPin size={12} color={theme.colors.primary} />
                    <Text style={[styles.metaVal, { color: theme.colors.primary }]}>{animal.currentLocationName || 'N/A'}</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
             <View style={[styles.placeholderCard, { borderColor: theme.colors.border + '50' }]}>
                <Info size={24} color={theme.colors.textMuted} />
                <Text style={[styles.placeholderText, { color: theme.colors.textMuted }]}>
                  Search an animal to begin the relocation process.
                </Text>
             </View>
          )}
          
          <View style={styles.assignmentSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Relocation Details</Text>
            
            {/* Location Selectors */}
            <View style={[styles.formCard, { backgroundColor: theme.colors.surface }]}>
              <GSelect 
                label="Target Shed*" 
                placeholder="Select from your sheds"
                value={locationId} 
                onSelect={(val) => {
                  setLocationId(val);
                  if (val) setNewLocationName('');
                }}
                options={locations}
                rightIcon={<ArrowRightLeft size={18} color={theme.colors.textMuted} />}
              />
              
              <View style={styles.inputSpacer} />
              
              <View style={styles.orDivider}>
                <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
                <Text style={[styles.orText, { color: theme.colors.textMuted }]}>OR CREATE NEW</Text>
                <View style={[styles.line, { backgroundColor: theme.colors.border }]} />
              </View>

              <View style={styles.inputSpacer} />

              <GInput 
                label="New Shed Name" 
                placeholder="E.g. Quarantine Pen 2"
                value={newLocationName} 
                onChangeText={(val) => {
                  setNewLocationName(val);
                  if (val) setLocationId(null);
                }} 
                rightIcon={<Plus size={18} color={theme.colors.textMuted} />}
              />

              <View style={styles.inputSpacer} />

              <GInput 
                label="Remark" 
                placeholder="Reason for movement (Optional)"
                value={remark} 
                onChangeText={setRemark} 
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Footer */}
      <View style={[styles.footer, { paddingBottom: Platform.OS === 'ios' ? 34 : 24 }]}>
        <GButton 
          title="Confirm Assignment" 
          onPress={handleSave}
          loading={loading}
          disabled={!animal || (!locationId && !newLocationName)}
          containerStyle={styles.submitBtn}
        />
      </View>
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
    paddingBottom: 140,
  },
  searchSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Aligned to bottom of input area
    gap: 12,
  },
  inputFlex: {
    flex: 1,
  },
  addBtn: {
    height: 52,
    paddingHorizontal: 20,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.small,
  },
  addBtnText: {
    color: '#FFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  animalCard: {
    marginHorizontal: SPACING.lg,
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
    ...SHADOW.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  tagText: {
    color: '#FFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  breedText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    opacity: 0.8,
  },
  cardDivider: {
    height: 1,
    backgroundColor: theme.colors.border + '30',
    marginBottom: 16,
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    marginBottom: 4,
  },
  metaVal: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  placeholderCard: {
    marginHorizontal: SPACING.lg,
    height: 120,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginBottom: 32,
  },
  placeholderText: {
    textAlign: 'center',
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    marginTop: 10,
    lineHeight: 18,
  },
  assignmentSection: {
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    marginBottom: 16,
  },
  formCard: {
    borderRadius: 24,
    padding: 20,
    ...SHADOW.small,
  },
  inputSpacer: {
    height: 12,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 8,
  },
  line: {
    flex: 1,
    height: 1,
    opacity: 0.3,
  },
  orText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.lg,
    paddingTop: 16,
    backgroundColor: theme.colors.background,
    ...SHADOW.large,
  },
  submitBtn: {
    height: 56,
    borderRadius: 16,
  }
});

const Plus = ({ size, color }) => (
  <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color, fontSize: 24, fontWeight: 'bold' }}>+</Text>
  </View>
);

export default AddLocationScreen;
