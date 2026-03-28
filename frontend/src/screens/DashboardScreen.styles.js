import { StyleSheet, Platform, StatusBar as RNStatusBar } from 'react-native';
import { COLORS } from '../theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 48,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary, // Orange
  },
  menuButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    color: '#FFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flex: 1,
  },
  list: {
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tile: {
    backgroundColor: '#FFF',
    width: '31%', // Fits 3 columns comfortably
    aspectRatio: 1, // Makes the card perfectly square
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB', // Fine light border
    // Subtle modern shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tileIcon: {
    marginBottom: 12,
  },
  tileTitle: {
    fontSize: 13,
    color: '#111827',
    fontFamily: 'Montserrat_500Medium',
    textAlign: 'center',
  },
});
