import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  View
} from 'react-native';
import ProjectList from './ProjectList'

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
    backgroundColor: '#3B424C',
    paddingTop: 22
  },
});

AppRegistry.registerComponent('ZooniverseMobile', () => ZooniverseMobile);
