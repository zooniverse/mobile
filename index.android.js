import React, { Component } from 'react';
import {
  AppRegistry,
  View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import ProjectList from './ProjectList'
import theme from './theme'

class ZooniverseMobile extends Component {
  render() {
    return (
      <View style={styles.container}>
        <ProjectList />
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: '$appBackgroundColor'
  },
});

EStyleSheet.build(theme);
AppRegistry.registerComponent('ZooniverseMobile', () => ZooniverseMobile);
