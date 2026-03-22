import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../theme/ThemeContext';
import { ArrowLeft } from 'lucide-react-native';

const GHeader = ({ title, onBack, rightIcon, onRightPress, subTitle }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.colors.primary, ...theme.shadow.md }]}>
      <StatusBar style="light" backgroundColor={theme.colors.primary} translucent={true} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
            <ArrowLeft color={theme.colors.white} size={28} />
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.colors.white }]} numberOfLines={1}>{title}</Text>
            {subTitle && <Text style={[styles.subTitle, { color: 'rgba(255,255,255,0.8)' }]}>{subTitle}</Text>}
          </View>
          
          {rightIcon ? (
            <TouchableOpacity onPress={onRightPress} style={styles.rightButton}>
              {rightIcon}
            </TouchableOpacity>
          ) : (
            <View style={{ width: 36 }} />
          )}
        </View>
      </SafeAreaView>
      <View style={styles.curve} />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    zIndex: 10,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 4,
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  headerContent: {
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: -2,
    opacity: 0.9,
    textTransform: 'uppercase',
  },
  rightButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  curve: {
    height: 10,
    backgroundColor: 'transparent',
  }
});

export default GHeader;
