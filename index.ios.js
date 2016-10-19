import React, { Component } from 'react';
import {
  AppRegistry,
  StatusBar,
  View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import App from './src/containers/app'
import GoogleAnalytics from 'react-native-google-analytics-bridge'
import theme from './src/theme'
import {GLOBALS} from './src/constants/globals'

GoogleAnalytics.setTrackerId(GLOBALS.GOOGLE_ANALYTICS_TRACKING)
GoogleAnalytics.trackEvent('view', 'Home')

class ZooniverseMobile extends Component {
  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          hidden={false}
          translucent={false}
        />
        <App />
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$appBackgroundColor'
  },
});

EStyleSheet.build(theme);
AppRegistry.registerComponent('ZooniverseMobile', () => ZooniverseMobile);
