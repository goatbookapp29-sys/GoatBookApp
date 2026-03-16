import { StyleSheet } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    ...SHADOW.sm,
  },
  userInfo: {
    flex: 1,
  },
  welcome: {
    fontSize: 12,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  farmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  farmName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 6,
  },
  logoutBtn: {
    padding: SPACING.sm,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },
  content: {
    padding: SPACING.lg,
    flex: 1,
  },
  welcomeSection: {
    marginBottom: SPACING.xl,
  },
  hiText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subHi: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  row: {
    justifyContent: 'space-between',
  },
  list: {
    paddingBottom: SPACING.xl,
  },
  tile: {
    backgroundColor: COLORS.white,
    width: '48%',
    borderRadius: 20,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOW.md,
  },
  tileIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFF1EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tileTitle: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  tileCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 2,
  },
});
