import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../theme/ThemeContext';
import { ArrowLeft, Menu } from 'lucide-react-native';

const GHeader = ({ title, onBack, onMenu, rightIcon, onRightPress, subTitle }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.colors.primary }]}>
      <StatusBar style="light" backgroundColor={theme.colors.primary} translucent={true} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContent}>
          <View style={styles.leftAction}>
            {onMenu && (
              <TouchableOpacity onPress={onMenu} style={styles.actionBtn} activeOpacity={0.7}>
                <Menu color={theme.colors.white} size={28} />
              </TouchableOpacity>
            )}
            {onBack && (
              <TouchableOpacity onPress={onBack} style={styles.actionBtn} activeOpacity={0.7}>
                <ArrowLeft color={theme.colors.white} size={28} />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.colors.white }]} numberOfLines={1}>{title}</Text>
            {subTitle && (
              <View style={styles.subTitleBox}>
                <Text style={[styles.subTitle, { color: 'rgba(255,255,255,0.85)' }]}>{subTitle}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.rightAction}>
            {rightIcon && (
              <TouchableOpacity onPress={onRightPress} style={styles.actionBtn}>
                {rightIcon}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
      <View style={[styles.bottomCurve, { backgroundColor: theme.colors.surface }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    zIndex: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  headerContent: {
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) + 12 : 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  leftAction: {
    width: 44,
  },
  rightAction: {
    width: 44,
    alignItems: 'flex-end',
  },
  actionBtn: {
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
  },
  title: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    letterSpacing: -1,
    textAlign: 'center',
  },
  subTitleBox: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
  },
  subTitle: {
    fontSize: 10,
    fontFamily: 'Montserrat_700Bold',
    letterSpacing: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  bottomCurve: {
    height: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
  }
});

export default GHeader;
