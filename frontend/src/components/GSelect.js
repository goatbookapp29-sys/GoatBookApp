import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Modal, FlatList, SafeAreaView, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { lightTheme } from '../theme';
import { ChevronDown, X, AlertCircle, HelpCircle } from 'lucide-react-native';

const GSelect = ({ 
  label, 
  value, 
  options = [], 
  onSelect, 
  error, 
  required,
  placeholder = '',
  containerStyle,
  helpAction
}) => {
  const { isDarkMode, theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: (value || modalVisible) ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, modalVisible]);

  const labelContainerStyle = {
    position: 'absolute',
    left: 12,
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [14, -10],
    }),
    zIndex: 2,
    backgroundColor: (value || modalVisible) ? theme.colors.surface : 'transparent',
    paddingHorizontal: (value || modalVisible) ? 4 : 0,
    flexDirection: 'row',
    alignItems: 'center',
    pointerEvents: 'box-none',
    maxWidth: '72%',
  };

  const labelTextStyle = {
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [15, 11],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.colors.textLight, error ? theme.colors.error : theme.colors.primary],
    }),
    fontFamily: (value || modalVisible) ? theme.typography.semiBold : (theme.typography.medium || 'System'),
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
        style={[
          styles.inputWrapper, 
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          error && { borderColor: theme.colors.error, borderWidth: 2 },
          modalVisible && { borderColor: theme.colors.primary, borderWidth: 2 }
        ]}
      >
        <Animated.View style={labelContainerStyle} pointerEvents="box-none">
          <Animated.Text 
            style={labelTextStyle} 
            numberOfLines={1} 
            ellipsizeMode="tail"
          >
            {label}{required && '*'}
          </Animated.Text>
          {helpAction && (
            <Animated.View style={{
              marginLeft: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 3],
              }),
              transform: [{
                scale: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1.1, 0.85],
                })
              }],
              marginTop: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [2, 1],
              }),
            }}>
              <TouchableOpacity 
                onPress={helpAction}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <HelpCircle size={16} color={theme.colors.textMuted} strokeWidth={1.5} />
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
        
        {value || modalVisible ? (
          <Text 
            style={[styles.valueText, { color: theme.colors.text }, !value && { color: theme.colors.textMuted }]} 
            numberOfLines={1}
          >
            {selectedOption?.label || placeholder}
          </Text>
        ) : <View style={{ flex: 1 }} />}

        <View style={styles.iconContainer}>
          {error ? (
            <AlertCircle size={20} color={theme.colors.error} />
          ) : (
            <ChevronDown size={20} color={theme.colors.textLight} />
          )}
        </View>
      </TouchableOpacity>

      {error ? (
        <View style={styles.errorContainer}>
           <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
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
          <SafeAreaView style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Choose {label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={theme.colors.text} />
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
                    { borderBottomColor: theme.colors.border },
                    item.value === value && { backgroundColor: isDarkMode ? '#1E293B' : '#FFF1EA' }
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    { color: theme.colors.text },
                    item.value === value && { color: theme.colors.primary, fontWeight: '600' }
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
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 56,
  },
  valueText: {
    fontSize: 15,
    flex: 1,
    marginRight: 8,
    fontWeight: '500',
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    paddingRight: 4,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '70%',
    ...lightTheme.shadow.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  listContainer: {
    paddingBottom: 40,
  },
  optionItem: {
    padding: 20,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
  },
});

export default GSelect;
