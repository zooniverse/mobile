import React, { Component } from 'react';
import {
  AppRegistry,
  StatusBar,
  StyleSheet,
  View
} from 'react-native';
import ProjectList from './ProjectList'

var backgroundColor = '#3B424C'

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
    backgroundColor: backgroundColor
  },
});

AppRegistry.registerComponent('ZooniverseMobile', () => ZooniverseMobile);
