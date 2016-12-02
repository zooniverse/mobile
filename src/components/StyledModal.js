import React, { Component } from 'react'
import {
  Modal,
  ScrollView,
  TouchableOpacity,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import Icon from 'react-native-vector-icons/FontAwesome'

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
            <ScrollView contentContainerStyle={styles.innerContainer}>
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
  innerContainer: {
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 4,
    marginTop: 40,
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
    top: 13,
    right: 13
  }
})

StyledModal.propTypes = {
  children: React.PropTypes.array,
  isVisible: React.PropTypes.bool,
  setVisibility: React.PropTypes.func
}

export default StyledModal
