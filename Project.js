import React, { Component } from 'react';
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

class Project extends Component {
  handleClick() {
    const zurl='http://zooniverse.org'
    Linking.canOpenURL(zurl).then(supported => {
      if (supported) {
        Linking.openURL(zurl);
      } else {
        console.log('Don\'t know how to open URI: ' + zurl);
      }
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={this.handleClick}>
          <Text style={styles.project}>{this.props.title}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    borderBottomColor: 'black',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
    marginLeft: 5,
    paddingLeft: 25,
    paddingRight: 25,
    paddingBottom: 10
  },
  project: {
    color: '#F9F9F9',
    fontSize: 20,
  },
});

export default Project
