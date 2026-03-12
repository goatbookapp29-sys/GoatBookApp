import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Modal, FlatList, SafeAreaView, Platform } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';
import { ChevronDown, X, AlertCircle } from 'lucide-react-native';

const GSelect = ({ 
  label, 
  value, 
  options = [], 
  onSelect, 
  error, 
  required,
  placeholder = ''
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: (value || modalVisible) ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, modalVisible]);

  const labelStyle = {
    position: 'absolute',
    left: 12,
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [14, -10],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [COLORS.textLight, error ? COLORS.error : COLORS.primary],
    }),
    backgroundColor: (value || modalVisible) ? COLORS.white : 'transparent',
    paddingHorizontal: (value || modalVisible) ? 4 : 0,
    zIndex: 1,
    fontWeight: (value || modalVisible) ? '600' : '400',
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
        style={[
          styles.inputWrapper, 
          error && styles.inputError,
          modalVisible && styles.inputActive
        ]}
      >
        <Animated.Text style={labelStyle} pointerEvents="none">
          {label}{required && '*'}
        </Animated.Text>
        
        {/* Selection text only visible when label has moved up to border */}
        {value || modalVisible ? (
          <Text 
            style={[styles.valueText, !value && { color: '#9CA3AF' }]} 
            numberOfLines={1}
          >
            {selectedOption?.label || placeholder}
          </Text>
        ) : <View style={{ flex: 1 }} />}

        <View style={styles.iconContainer}>
          {error ? (
            <AlertCircle size={20} color={COLORS.error} />
          ) : (
            <ChevronDown size={20} color={COLORS.textLight} />
          )}
        </View>
      </TouchableOpacity>

      {error ? (
        <View style={styles.errorContainer}>
           <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose {label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              contentContainerStyle={styles.listContainer}
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
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    height: 56,
  },
  inputActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  valueText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Aligns error text to the right corner
    marginTop: 4,
    paddingRight: 4,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    ...SHADOW.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  listContainer: {
    paddingBottom: 40,
  },
  optionItem: {
    padding: 20,
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
