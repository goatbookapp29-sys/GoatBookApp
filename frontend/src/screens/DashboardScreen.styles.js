import { StyleSheet, Platform, StatusBar as RNStatusBar } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 48,
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    ...SHADOW.lg,
  },
  userInfo: {
    flex: 1,
  },
  welcome: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  farmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  farmName: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.white,
    marginLeft: 6,
    letterSpacing: -0.5,
  },
  logoutBtn: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 20,
    flex: 1,
    marginTop: 0, // Removed negative margin to prevent overlap
    paddingTop: 20,
  },
  welcomeSection: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  hiText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  subHi: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
    fontWeight: '500',
  },
  row: {
    justifyContent: 'space-between',
  },
  list: {
    paddingBottom: 40,
  },
  tile: {
    backgroundColor: COLORS.white,
    width: '48%',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    ...SHADOW.md,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  tileIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFF1EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  tileInfo: {
    paddingLeft: 4,
  },
  tileTitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tileCount: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
    marginTop: 1,
  },
});
