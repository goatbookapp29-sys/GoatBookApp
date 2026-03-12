import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { COLORS, SPACING } from '../theme';
import { ArrowLeft } from 'lucide-react-native';

const GHeader = ({ title, onBack, rightIcon, onRightPress }) => {
  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="white" translucent={true} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContent}>
          <View style={styles.leftSection}>
            <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
              <ArrowLeft color={COLORS.white} size={28} />
            </TouchableOpacity>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
          </View>
          
          {rightIcon && (
            <TouchableOpacity onPress={onRightPress} style={styles.rightButton}>
              {rightIcon}
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
      <View style={styles.headerBottom} />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: COLORS.white,
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  safeArea: {
    backgroundColor: COLORS.white,
  },
  headerContent: {
    backgroundColor: COLORS.primary,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: SPACING.md,
    padding: 4,
  },
  rightButton: {
    padding: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
    flex: 1,
  },
  headerBottom: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  }
});

export default GHeader;
