import React, { Component } from 'react';
import {
  AppRegistry,
  View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import App from './src/containers/app'
import theme from './src/theme'

class ZooniverseMobile extends Component {
  render() {
    return (
      <View style={styles.container}>
        <App />
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
});

EStyleSheet.build(theme);
AppRegistry.registerComponent('ZooniverseMobile', () => ZooniverseMobile);
