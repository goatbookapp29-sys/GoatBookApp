import { StyleSheet } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.lg,
    ...SHADOW.md,
    marginBottom: SPACING.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: SPACING.md,
  },
  flex: {
    flex: 1,
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  infoText: {
    color: '#1D4ED8',
    fontSize: 12,
  },
  animalDetailCard: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  submitBtn: {
    marginTop: SPACING.md,
  },
});
