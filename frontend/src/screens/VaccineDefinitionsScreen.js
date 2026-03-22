import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import GHeader from '../components/GHeader';
import { ListPlus, Plus, Calendar, Settings } from 'lucide-react-native';
import api from '../api';
import { useFocusEffect } from '@react-navigation/native';

const VaccineDefinitionsScreen = ({ navigation }) => {
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchVaccines();
    }, [])
  );

  const fetchVaccines = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vaccines');
      setVaccines(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch vaccines error:', error);
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.recordItem}>
      <View style={styles.recordHeader}>
        <View style={styles.iconBox}>
          <ListPlus size={20} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.vaccineName}>{item.name}</Text>
          <Text style={styles.daysText}>Required every {item.daysBetween} days</Text>
        </View>
        <TouchableOpacity style={styles.editBtn}>
           <Settings size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>
      {item.remark ? (
        <Text style={styles.remarkText}>{item.remark}</Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <GHeader title="Vaccine Names" onBack={() => navigation.goBack()} />
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={vaccines}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ListPlus size={64} color="#E5E7EB" />
              <Text style={styles.emptyText}>No vaccines defined yet</Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button to Add */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddVaccineName')}
      >
        <Plus size={30} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  recordItem: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vaccineName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  daysText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  remarkText: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.textLight,
    fontStyle: 'italic',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  editBtn: {
    padding: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textLight,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.md,
    elevation: 8,
  }
});

export default VaccineDefinitionsScreen;
