import React, { Component } from 'react'
import {
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import Icon from 'react-native-vector-icons/FontAwesome'
import PropTypes from 'prop-types';

const top = (Platform.OS === 'ios') ? 10 : 0

class StyledModal extends Component {
  render() {
    return (
      <View>
        <Modal
          animationType={'fade'}
          transparent={true}
          onRequestClose={() => {}}
          visible={this.props.isVisible}>
          <View style={styles.container}>
            <ScrollView style={styles.outerContainer} contentContainerStyle={styles.innerContainer}>
              { this.props.children }
            </ScrollView>
          </View>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => this.props.setVisibility(false)}
            style={styles.closeIcon}>
            <Icon name="times" style={styles.icon} />
          </TouchableOpacity>
        </Modal>

      </View>
    )
  }
}

const styles = EStyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'flex-start',
    padding: 20,
  },
  outerContainer: {
    top: 20 + top,
    marginBottom: 30,
  },
  innerContainer: {
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 24,
  },
  icon: {
    backgroundColor: 'transparent',
    color: 'white',
    fontSize: 24,
    padding: 15,
  },
  closeIcon: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: top,
    right: 13
  }
})

StyledModal.propTypes = {
  children: PropTypes.array,
  isVisible: PropTypes.bool,
  setVisibility: PropTypes.func
}

export default StyledModal
