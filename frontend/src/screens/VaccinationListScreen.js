import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import GHeader from '../components/GHeader';
import { Syringe, Calendar, User, Tag, ChevronRight, Hash, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import api from '../api';
import { useFocusEffect } from '@react-navigation/native';

const VaccinationListScreen = ({ navigation, route }) => {
  const { theme, isDarkMode } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  
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
    } catch (error) {
      console.error('Fetch records error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBoosterStatus = (nextDueDate) => {
    if (!nextDueDate) return null;
    const today = new Date();
    const due = new Date(nextDueDate);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Overdue', color: '#EF4444', icon: <AlertTriangle size={12} color="#EF4444" /> };
    if (diffDays <= 7) return { label: 'Due Soon', color: '#F59E0B', icon: <AlertTriangle size={12} color="#F59E0B" /> };
    return { label: 'Active', color: '#10B981', icon: <CheckCircle2 size={12} color="#10B981" /> };
  };

  const renderItem = ({ item }) => {
    const booster = getBoosterStatus(item.nextDueDate);
    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AddVaccination', { record: item })}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '10' }]}>
            <Syringe size={22} color={theme.colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.vaccineName, { color: theme.colors.text }]}>{item.vaccines?.name}</Text>
            <View style={styles.tagRow}>
              <Hash size={14} color={theme.colors.textMuted} />
              <Text style={[styles.tagNumber, { color: theme.colors.text }]}>{item.animals?.tag_number}</Text>
              <Text style={[styles.modeLabel, { backgroundColor: item.creation_mode === 'MASS' ? theme.colors.info + '15' : theme.colors.border + '30', color: item.creation_mode === 'MASS' ? theme.colors.info : theme.colors.textLight }]}>
                {item.creation_mode}
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={theme.colors.textMuted} />
        </View>

        <View style={[styles.cardBody, { borderTopColor: theme.colors.border + '15' }]}>
          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <View style={styles.labelRow}>
                <Calendar size={12} color={theme.colors.textLight} />
                <Text style={[styles.metaLabel, { color: theme.colors.textLight }]}>ADMIN DATE</Text>
              </View>
              <Text style={[styles.metaValue, { color: theme.colors.text }]}>
                {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Text>
            </View>
            <View style={styles.metaCol}>
              <View style={styles.labelRow}>
                <Text style={[styles.metaLabel, { color: theme.colors.textLight }]}>NEXT DUE</Text>
              </View>
              <Text style={[styles.metaValue, { color: booster ? booster.color : theme.colors.textLight }]}>
                {item.next_due_date ? new Date(item.next_due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {booster && (
          <View style={[styles.boosterFooter, { backgroundColor: booster.color + '08' }]}>
            {booster.icon}
            <Text style={[styles.boosterText, { color: booster.color }]}>Booster is {booster.label}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GHeader title="Vaccination Journal" onBack={() => navigation.goBack()} leftAlign={true} />
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={records}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.colors.border + '20' }]}>
                <Syringe size={48} color={theme.colors.textMuted} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Records Yet</Text>
              <Text style={[styles.emptySub, { color: theme.colors.textLight }]}>
                Historical vaccination events will appear here once recorded.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1.2,
    marginBottom: 16,
    overflow: 'hidden',
    ...SHADOW.small,
  },
  cardHeader: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  vaccineName: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagNumber: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  modeLabel: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  metaRow: {
    flexDirection: 'row',
    paddingTop: 16,
  },
  metaCol: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  boosterFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  boosterText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default VaccinationListScreen;
