import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Search, Plus, Scale, Calendar, Info, Trash2 } from 'lucide-react-native';
import { COLORS } from '../theme';
import GHeader from '../components/GHeader';
import api from '../api';
import styles from './WeightListScreen.styles';
import { getFromCache, saveToCache } from '../utils/cache';

const WeightListScreen = ({ navigation }) => {
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
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <Scale size={24} color={COLORS.primary} />
      </View>
      <View style={styles.mainInfo}>
        <Text style={styles.tagText}>Tag: {item.tagNumber}</Text>
        <Text style={styles.dateText}>{item.date}</Text>
      </View>
      <View style={styles.statsBox}>
        <Text style={styles.weightValue}>{item.weight} KG</Text>
        {item.height && <Text style={styles.heightValue}>H: {item.height}</Text>}
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
    <View style={styles.container}>
      <GHeader title="Weight History" onBack={() => navigation.goBack()} />
      
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Tag ID..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
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
                <Info size={48} color={COLORS.textLight} />
                <Text style={styles.emptyText}>No weight records found</Text>
              </View>
            }
          />
        )}
      </View>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('AddWeight')}
      >
        <Plus size={30} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

export default WeightListScreen;
