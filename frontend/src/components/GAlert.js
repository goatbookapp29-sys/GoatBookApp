import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');

const GAlert = ({ 
  visible, 
  title, 
  message, 
  onClose, 
  type = 'error', // 'error', 'success', 'info', 'warning'
  confirmText = 'OK' 
}) => {
  const { theme } = useTheme();

  const getIcon = () => {
    const size = 32;
    switch (type) {
      case 'success':
        return <CheckCircle2 size={size} color="#10B981" />;
      case 'warning':
        return <AlertCircle size={size} color="#F59E0B" />;
      case 'info':
        return <Info size={size} color="#3B82F6" />;
      case 'error':
      default:
        return <XCircle size={size} color="#EF4444" />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'success':
        return '#ECFDF5';
      case 'warning':
        return '#FFFBEB';
      case 'info':
        return '#EFF6FF';
      case 'error':
      default:
        return '#FEF2F2';
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.iconContainer, { backgroundColor: getIconBg() }]}>
            {getIcon()}
          </View>

          <Text style={[styles.title, { color: theme.colors.text }]}>
            {title}
          </Text>

          <Text style={[styles.message, { color: theme.colors.textLight }]}>
            {message}
          </Text>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.colors.primary }]} 
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  button: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});

export default GAlert;
