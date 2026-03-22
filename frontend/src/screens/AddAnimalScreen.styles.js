import { StyleSheet } from 'react-native';
import { COLORS, SPACING, SHADOW } from '../theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    flexGrow: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  formContainer: {
    marginTop: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  halfWidth: {
    flex: 1,
    marginHorizontal: 4,
  },
  footer: {
    marginTop: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfBtn: {
    width: '48%',
  },
  maleLabel: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
    marginRight: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: COLORS.text,
  },
  weightSection: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  weightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  weightContent: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  addNewBtn: {
    backgroundColor: '#FF6B00',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginBottom: SPACING.md,
  },
  addNewText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 6,
  },
  noRecordsText: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 20,
    marginBottom: 20,
  },
  weightList: {
    width: '100%',
  },
  weightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  weightIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF1EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  weightInfoBlock: {
    flex: 1,
  },
  weightKg: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  weightDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  heightInfoBlock: {
    alignItems: 'flex-end',
  },
  weightLabel: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  weightValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  readyForSaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  readyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
