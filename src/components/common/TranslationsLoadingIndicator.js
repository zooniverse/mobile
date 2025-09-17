import { View, ActivityIndicator, StyleSheet } from 'react-native';
import FontedText from './FontedText';
import theme from '../../theme';

const TranslationsLoadingIndicator = () => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.$zooniverseTeal} />
      <FontedText style={styles.loadingText}>Loading Translations </FontedText>
    </View>
  );
};

export default TranslationsLoadingIndicator;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    
  },
  loadingText: {
    color: theme.$zooniverseTeal,
  },
});
