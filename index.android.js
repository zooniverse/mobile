import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View
} from 'react-native';
import ProjectList from './ProjectList'

var backgroundColor = '#3B424C'

class ZooniverseMobile extends Component {
  render() {
    return (
      <View style={styles.container}>
        <ProjectList />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: backgroundColor
  },
});

AppRegistry.registerComponent('ZooniverseMobile', () => ZooniverseMobile);
