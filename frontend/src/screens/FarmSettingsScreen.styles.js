import { StyleSheet } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    padding: SPACING.lg,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    ...SHADOW.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xl,
  },
  submitBtn: {
    marginTop: SPACING.md,
  },
  infoBox: {
    backgroundColor: '#FFFBEB',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    color: '#92400E',
    fontSize: 12,
    flex: 1,
    marginLeft: 10,
  }
});
