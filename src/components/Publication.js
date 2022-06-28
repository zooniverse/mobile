import React, { Component } from 'react';
import {
  Alert,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import PropTypes from 'prop-types';
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledText from './StyledText'
import Icon from 'react-native-vector-icons/FontAwesome'

class Publication extends Component {
  constructor(props) {
    super(props)
    this.handlePress = this.handlePress.bind(this)
  }

  handlePress() {
    const zurl=this.props.publication.href
    Linking.canOpenURL(zurl).then(supported => {
      if (supported) {
        Linking.openURL(zurl);
      } else {
        Alert.alert(
          'Error', 'Sorry, but it looks like this publication is currently unavailable.',
        )
      }
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={this.handlePress}>
          <View style={styles.titleContainer}>
            <StyledText textStyle={'citation'} text={ this.props.publication.citation } />
            <Icon name="angle-right" style={styles.icon} />
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    padding: 10,
    paddingLeft: 15,
    paddingRight: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '$lightGrey',
  },
  titleContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  icon: {
    backgroundColor: '$transparent',
    color: 'grey',
    fontSize: 30,
    padding: 10,
  }
});

Publication.propTypes = { publication: PropTypes.object }
export default Publication
