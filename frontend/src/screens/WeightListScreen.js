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
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '15' }]}>
        <Scale size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.mainInfo}>
        <Text style={[styles.tagText, { color: theme.colors.text, fontFamily: 'Montserrat_700Bold' }]}>Tag: {item.tagNumber}</Text>
        <Text style={[styles.dateText, { color: theme.colors.textLight, fontFamily: 'Montserrat_500Medium' }]}>{item.date}</Text>
      </View>
      <View style={styles.statsBox}>
        <Text style={[styles.weightValue, { color: theme.colors.primary, fontFamily: 'Montserrat_700Bold' }]}>{item.weight} KG</Text>
        {item.height && <Text style={[styles.heightValue, { color: theme.colors.textMuted, fontFamily: 'Montserrat_500Medium' }]}>H: {item.height}</Text>}
      </View>
      <TouchableOpacity 
        style={styles.deleteBtn} 
        onPress={() => handleDelete(item.id)}
      >
        <Trash2 size={18} color={theme.colors.error || '#EF4444'} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GHeader title="Weight Records" subTitle="Performance Tracking" onBack={() => navigation.goBack()} />
      
      <View style={styles.content}>
        <View style={[styles.searchWrapper, { backgroundColor: theme.colors.surface }]}>
          <Search size={20} color={theme.colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text, fontFamily: 'Montserrat_500Medium' }]}
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
              <View style={styles.emptyWrapper}>
                <View style={[styles.emptyIconBox, { backgroundColor: theme.colors.primary + '10' }]}>
                  <Scale size={80} color={theme.colors.primary + '40'} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.colors.text, fontFamily: 'Montserrat_700Bold' }]}>No weight records found</Text>
                <Text style={[styles.emptySubtitle, { color: theme.colors.textMuted, fontFamily: 'Montserrat_500Medium' }]}>
                  Keep track of your animals' growth performance here.
                </Text>
                <TouchableOpacity 
                  style={[styles.emptyActionBtn, { backgroundColor: theme.colors.primary }]}
                  onPress={() => navigation.navigate('AddWeight')}
                >
                  <Text style={[styles.emptyActionText, { color: 'white', fontFamily: 'Montserrat_600SemiBold' }]}>Record First Weight</Text>
                </TouchableOpacity>
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
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 54,
    borderRadius: 16,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  list: {
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    marginBottom: 16,
    ...SHADOW.md,
  },
  iconBox: {
    width: 60,
    height: 60,
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
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: 13,
    marginTop: 2,
  },
  statsBox: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  weightValue: {
    fontSize: 20,
    letterSpacing: -0.5,
  },
  heightValue: {
    fontSize: 12,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 8,
    marginLeft: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconBox: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyActionBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    ...SHADOW.md,
  },
  emptyActionText: {
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});

export default WeightListScreen;
