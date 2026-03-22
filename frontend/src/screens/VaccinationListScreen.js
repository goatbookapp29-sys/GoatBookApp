import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import GHeader from '../components/GHeader';
import { Syringe, Calendar, User, ChevronRight } from 'lucide-react-native';
import api from '../api';
import { useFocusEffect } from '@react-navigation/native';

const VaccinationListScreen = ({ navigation }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchRecords();
    }, [])
  );

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get('/vaccines/records');
      setRecords(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch vaccination records error:', error);
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.recordItem}>
      <View style={styles.recordHeader}>
        <View style={styles.iconBox}>
          <Syringe size={20} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.vaccineName}>{item.vaccine?.name}</Text>
          <View style={styles.tagRow}>
            <User size={14} color={COLORS.textLight} />
            <Text style={styles.tagNumber}>Tag: {item.animal?.tagNumber}</Text>
          </View>
        </View>
        <View style={styles.dateBox}>
          <Calendar size={12} color={COLORS.textLight} />
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
      </View>
      
      {item.nextDueDate && (
        <View style={styles.dueSection}>
          <Text style={styles.dueLabel}>Next Due Date:</Text>
          <Text style={styles.dueValue}>{item.nextDueDate}</Text>
        </View>
      )}

      {item.remark ? (
        <Text style={styles.remarkText} numberOfLines={2}>Note: {item.remark}</Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <GHeader title="All Vaccinations" onBack={() => navigation.goBack()} />
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={records}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Syringe size={64} color="#E5E7EB" />
              <Text style={styles.emptyText}>No vaccination records found</Text>
            </View>
          }
        />
      )}
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
  },
  recordItem: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
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
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  tagNumber: {
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: 4,
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textLight,
    marginLeft: 4,
    fontWeight: '600',
  },
  dueSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB', // Light amber/yellow
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  dueLabel: {
    fontSize: 13,
    color: '#D97706',
    fontWeight: '600',
  },
  dueValue: {
    fontSize: 13,
    color: '#D97706',
    fontWeight: '700',
  },
  remarkText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontStyle: 'italic',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
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
});

export default VaccinationListScreen;
