import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Modal, FlatList, SafeAreaView } from 'react-native';
import { COLORS, SPACING } from '../theme';
import { ChevronDown, X } from 'lucide-react-native';

const GSelect = ({ 
  label, 
  value, 
  options = [], 
  onSelect, 
  error, 
  required,
  placeholder = 'Select'
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const labelStyle = {
    position: 'absolute',
    left: 12,
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [14, -10],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [15, 12],
    }),
    color: COLORS.textLight,
    backgroundColor: value ? COLORS.white : 'transparent',
    paddingHorizontal: value ? 4 : 0,
    zIndex: 1,
  };

  const selectedOption = options.find(opt => opt.value === value) || { label: '' };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
        style={[
          styles.inputWrapper, 
          error && styles.inputError
        ]}
      >
        <Animated.Text style={labelStyle}>
          {label}{required && '*'}
        </Animated.Text>
        
        <Text style={[styles.valueText, !value && { color: 'transparent' }]}>
          {selectedOption.label || placeholder}
        </Text>

        <ChevronDown size={20} color={COLORS.textLight} />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.optionItem,
                    item.value === value && styles.selectedOptionItem
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    item.value === value && styles.selectedOptionText
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    height: 52,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  valueText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 2,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  optionItem: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedOptionItem: {
    backgroundColor: '#FFF1EA',
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  selectedOptionText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default GSelect;
