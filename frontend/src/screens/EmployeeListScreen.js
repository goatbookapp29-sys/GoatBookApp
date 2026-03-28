import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { lightTheme } from '../theme';
import GHeader from '../components/GHeader';
import { UserPlus, ChevronRight, User } from 'lucide-react-native';
import api from '../api';
import { useFocusEffect } from '@react-navigation/native';

const EmployeeListScreen = ({ navigation }) => {
  const { isDarkMode, theme } = useTheme();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchEmployees();
    }, [])
  );

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/employees');
      setEmployees(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch employees error:', error);
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.item, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={() => navigation.navigate('EditEmployee', { employee: item })}
    >

      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.colors.text }]}>{item.name}</Text>
        <Text style={[styles.role, { color: theme.colors.textLight }]}>{item.role} • {item.email}</Text>
      </View>
      <ChevronRight size={20} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <GHeader 
        title="Employee List" 
        onBack={() => navigation.goBack()} 
      />
      
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('AddEmployee')}
        >
          <UserPlus color={theme.colors.white} size={20} style={styles.plusIcon} />
          <Text style={styles.addButtonText}>Add Employee</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={employees}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: theme.colors.textLight }]}>No employees added yet.</Text>
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
    backgroundColor: '#FFFFFF',
  },
  actionRow: {
    padding: 16,
    alignItems: 'flex-end',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    ...lightTheme.shadow.sm,
  },
  addButtonText: {
    color: 'white',
    fontFamily: 'Montserrat_600SemiBold',
    marginLeft: 8,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#1F2937',
  },
  role: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'Montserrat_500Medium',
    color: '#6B7280',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
  }
});

export default EmployeeListScreen;
