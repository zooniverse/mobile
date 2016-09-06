import React, { Component } from 'react';
import {
  AppRegistry,
  StatusBar,
  StyleSheet,
  View
} from 'react-native';
import ProjectList from './ProjectList'

class ZooniverseMobile extends Component {
  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          hidden={false}
          translucent={false}
        />
        <ProjectList />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3B424C'
  },
});

AppRegistry.registerComponent('ZooniverseMobile', () => ZooniverseMobile);
