if (__DEV__) {
  import('./ReactotronConfig');
}

import 'react-native-gesture-handler';
import React, { Component } from 'react';
import { AppRegistry, Platform, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import EStyleSheet from 'react-native-extended-stylesheet';
import App from './src/containers/app';
import theme from './src/theme';

class ZooniverseMobile extends Component {
  render() {
    return (
      <SafeAreaProvider>
        <SafeAreaView
          style={styles.container}
          edges={Platform.OS === 'ios' ? ['left', 'right'] : []}
        >
          <PlatformSpecificStatusBar />
          <App />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }
}

const PlatformSpecificStatusBar = () => {
  const insets = useSafeAreaInsets();
  if (Platform.OS === 'ios') {
    const hasSideStatusBar = insets.left > 0 || insets.right > 0;
    return (
      <StatusBar
        barStyle={hasSideStatusBar ? 'dark-content' : 'light-content'}
        hidden={false}
        translucent={false}
      />
    );
  }

  return null;
};

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

EStyleSheet.build(theme);
AppRegistry.registerComponent('ZooniverseMobile', () => ZooniverseMobile);
