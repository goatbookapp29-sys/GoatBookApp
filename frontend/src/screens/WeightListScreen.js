import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import GHeader from '../components/GHeader';
import { Search, Plus, Scale, Trash2 } from 'lucide-react-native';
import api from '../api';
import { useFocusEffect } from '@react-navigation/native';
import { getFromCache, saveToCache } from '../utils/cache';
import { COLORS, SPACING, SHADOW } from '../theme';

const WeightListScreen = ({ navigation }) => {
  const { isDarkMode, theme } = useTheme();
  const [weights, setWeights] = useState([]);
  const [filteredWeights, setFilteredWeights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchWeights();
    }, [])
  );

  const fetchWeights = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      const response = await api.get('/weights');
      const data = response.data;
      setWeights(data);
      applyFilter(searchQuery, data);
      await saveToCache('weights', data);
    } catch (error) {
      console.error('Fetch weights error:', error);
      const cached = await getFromCache('weights');
      if (cached) {
        setWeights(cached);
        applyFilter(searchQuery, cached);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    applyFilter(query, weights);
  };

  const applyFilter = (query, data) => {
    if (!query) {
      setFilteredWeights(data);
    } else {
      const filtered = data.filter(w => 
        w.tagNumber.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredWeights(filtered);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Weight Record',
      'Are you sure you want to remove this weight record?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await api.delete(`/weights/${id}`);
              fetchWeights();
            } catch (error) {
              console.error('Delete weight error:', error);
              alert('Failed to delete weight record');
            }
          } 
        }
      ]
    );
  };

  const renderWeightItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#1E293B' : '#FFF1EA' }]}>
        <Scale size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.mainInfo}>
        <Text style={[styles.tagText, { color: theme.colors.text }]}>Tag: {item.tagNumber}</Text>
        <Text style={[styles.dateText, { color: theme.colors.textLight }]}>{item.date}</Text>
      </View>
      <View style={styles.statsBox}>
        <Text style={[styles.weightValue, { color: theme.colors.primary }]}>{item.weight} KG</Text>
        {item.height && <Text style={[styles.heightValue, { color: theme.colors.textLight }]}>H: {item.height}</Text>}
      </View>
      <TouchableOpacity 
        style={styles.deleteBtn} 
        onPress={() => handleDelete(item.id)}
      >
        <Trash2 size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GHeader title="Weight Records" subTitle="Performance Tracking" onBack={() => navigation.goBack()} />
      
      <View style={styles.content}>
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Search size={20} color={theme.colors.textLight} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search Tag Number..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {loading && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredWeights}
            renderItem={renderWeightItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => fetchWeights(true)} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Scale size={64} color={theme.colors.border} />
                <Text style={[styles.emptyText, { color: theme.colors.text }]}>No weight records found</Text>
                <Text style={[styles.emptySub, { color: theme.colors.textLight }]}>Start tracking growth by adding weight measurements.</Text>
              </View>
            }
          />
        )}
      </View>

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: theme.colors.primary, ...theme.shadow.lg }]} 
        onPress={() => navigation.navigate('AddWeight')}
      >
        <Plus size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 54,
    borderRadius: 16,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 80,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1.5,
    ...SHADOW.sm,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  mainInfo: {
    flex: 1,
  },
  tagText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  statsBox: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  weightValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  heightValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
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
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});

export default WeightListScreen;
