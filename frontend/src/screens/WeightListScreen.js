import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, RefreshControl, Modal, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import GHeader from '../components/GHeader';
import GConfirmModal from '../components/GConfirmModal';
import { Search, Plus, Scale, Trash2, Tag, ChevronRight, X } from 'lucide-react-native';
import api from '../api';
import { useFocusEffect } from '@react-navigation/native';
import { getFromCache, saveToCache } from '../utils/cache';
import { COLORS, SPACING, SHADOW } from '../theme';

const WeightListScreen = ({ navigation }) => {
  const { isDarkMode, theme } = useTheme();
  const styles = useMemo(() => getStyles(theme, isDarkMode), [theme, isDarkMode]);
  const [weights, setWeights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  
  // Custom Delete Modal State
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchWeights();
    }, [])
  );

  // Group weights by tag number for the summary view
  const groupedWeights = useMemo(() => {
    const groups = {};
    weights.forEach(w => {
      if (!groups[w.tagNumber]) {
        groups[w.tagNumber] = [];
      }
      groups[w.tagNumber].push(w);
    });
    
    // Sort each group by date (latest first)
    Object.keys(groups).forEach(tag => {
      groups[tag].sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    return groups;
  }, [weights]);

  // Unique tags for the main list, filtered by search query
  const tagList = useMemo(() => {
    const tags = Object.keys(groupedWeights).map(tag => ({
      tagNumber: tag,
      latestWeight: groupedWeights[tag][0].weight,
      latestDate: groupedWeights[tag][0].date,
      count: groupedWeights[tag].length,
      history: groupedWeights[tag]
    }));

    if (!searchQuery) return tags;
    return tags.filter(t => t.tagNumber.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [groupedWeights, searchQuery]);

  const openHistory = (tagData) => {
    setSelectedTag(tagData);
    setIsHistoryVisible(true);
  };

  const fetchWeights = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      const response = await api.get('/weights');
      setWeights(response.data);
      await saveToCache('weights', response.data);
    } catch (error) {
      console.error('Fetch weights error:', error);
      const cached = await getFromCache('weights');
      if (cached) setWeights(cached);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeletePress = (record) => {
    setRecordToDelete(record);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/weights/${recordToDelete.id}`);
      await fetchWeights();
      
      // If we deleted the last record in history, close history modal
      if (selectedTag && selectedTag.history.length === 1) {
        setIsHistoryVisible(false);
      } else if (selectedTag) {
        // Refresh local history view inside modal
        const updatedHistory = selectedTag.history.filter(h => h.id !== recordToDelete.id);
        setSelectedTag({ ...selectedTag, history: updatedHistory });
      }
      
      setIsDeleteModalVisible(false);
      setRecordToDelete(null);
    } catch (error) {
      alert('Failed to delete record');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderTagItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.tagCard} 
      onPress={() => openHistory(item)}
      activeOpacity={0.8}
    >
      <View style={styles.tagCardHeader}>
        <View style={styles.tagBadge}>
          <Tag size={16} color={theme.colors.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.tagNumberText, { color: theme.colors.text }]}>{item.tagNumber}</Text>
        </View>
        <View style={[styles.countBadge, { backgroundColor: theme.colors.primary + '15' }]}>
          <Text style={[styles.countText, { color: theme.colors.primary }]}>{item.count} {item.count === 1 ? 'Record' : 'Records'}</Text>
        </View>
      </View>
      
      <View style={styles.tagCardFooter}>
        <View>
          <Text style={[styles.latestLabel, { color: theme.colors.textLight }]}>Latest Weight</Text>
          <Text style={[styles.latestValue, { color: theme.colors.primary }]}>{item.latestWeight} KG</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.latestLabel, { color: theme.colors.textLight }]}>Last Recorded</Text>
          <Text style={[styles.latestDate, { color: theme.colors.text }]}>{new Date(item.latestDate).toLocaleDateString()}</Text>
        </View>
      </View>
      <View style={styles.cardAction}>
        <Text style={[styles.viewAllText, { color: theme.colors.textLight }]}>View History</Text>
        <ChevronRight size={16} color={theme.colors.textMuted} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GHeader title="Weight Records" onBack={() => navigation.goBack()} leftAlign />
      
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Search size={20} color={theme.colors.textLight} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search Tag Number..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={tagList}
            renderItem={renderTagItem}
            keyExtractor={item => item.tagNumber}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => fetchWeights(true)} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Scale size={64} color={theme.colors.border} />
                <Text style={[styles.emptyText, { color: theme.colors.text }]}>No records found</Text>
                <Text style={[styles.emptySub, { color: theme.colors.textLight }]}>Add measurements to start tracking by tag.</Text>
              </View>
            }
          />
        )}
      </View>

      {/* History Modal */}
      <Modal
        visible={isHistoryVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsHistoryVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Weight History</Text>
                <Text style={[styles.modalSubtitle, { color: theme.colors.textLight }]}>Tag: {selectedTag?.tagNumber}</Text>
              </View>
              <TouchableOpacity onPress={() => setIsHistoryVisible(false)} style={styles.closeBtn}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.historyList}>
              {selectedTag?.history.map((record, index) => (
                <View key={record.id} style={styles.historyItem}>
                  <View style={styles.timeline}>
                    <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
                    {index !== selectedTag.history.length - 1 && <View style={[styles.line, { backgroundColor: theme.colors.border }]} />}
                  </View>
                  
                  <View style={[styles.historyCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                    <View style={styles.historyCardMain}>
                      <View>
                        <Text style={[styles.historyDate, { color: theme.colors.text }]}>{new Date(record.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                          {record.height ? <Text style={[styles.historyHeight, { color: theme.colors.textLight }]}>Height: {record.height} cm</Text> : null}
                          {record.remark ? <Text style={[styles.historyRemark, { color: theme.colors.textLight }]} numberOfLines={1}>• {record.remark}</Text> : null}
                        </View>
                      </View>
                      <Text style={[styles.historyWeight, { color: theme.colors.primary }]}>{record.weight} KG</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeletePress(record)} style={styles.deleteHistoryBtn}>
                      <Trash2 size={18} color={theme.colors.error + '90'} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <GConfirmModal
        visible={isDeleteModalVisible}
        title="Delete Weight Record?"
        message="Are you sure you want to remove this measurement? This growth history data cannot be recovered."
        confirmText="Delete"
        type="delete"
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
        loading={isDeleting}
      />

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: theme.colors.primary }]} 
        onPress={() => navigation.navigate('AddWeight')}
      >
        <Plus size={30} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const getStyles = (theme, isDarkMode) => StyleSheet.create({
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
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  list: {
    paddingBottom: 80,
  },
  tagCard: {
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  tagCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagNumberText: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  tagCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border + '50',
  },
  latestLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  latestValue: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  latestDate: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '85%',
    padding: 24,
    ...theme.shadow.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
  },
  modalSubtitle: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
  },
  historyList: {
    paddingBottom: 40,
  },
  historyItem: {
    flexDirection: 'row',
    gap: 16,
  },
  timeline: {
    width: 20,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 1,
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: -2,
  },
  historyCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.2,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyCardMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    marginRight: 16,
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  historyHeight: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  historyRemark: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
    flexShrink: 1,
  },
  historyWeight: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  deleteHistoryBtn: {
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
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
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
    ...theme.shadow.lg,
  },
});

export default WeightListScreen;
