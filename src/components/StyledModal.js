import React, { Component } from 'react'
import {
  Modal,
  TouchableOpacity,
  View
} from 'react-native'
import { connect } from 'react-redux'
import EStyleSheet from 'react-native-extended-stylesheet'
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5'
import PropTypes from 'prop-types';
import DeviceInfo from 'react-native-device-info'

import FontedText from './common/FontedText';

import * as colorModes from '../displayOptions/colorModes'

const mapStateToProps = (state) => ({
  device: state.app.device
})

const isTablet = DeviceInfo.isTablet()

class StyledModal extends Component {

  render() {
    const widthModifier = isTablet ? .7 : .90
    const modalDimensions = {
      height: this.props.device.height * .85,
      width: Math.min(this.props.device.height, this.props.device.width) * widthModifier
    }

    return (
      <View>
        <Modal
          animationType={'fade'}
          transparent={true}
          onRequestClose={() => {}}
          visible={this.props.isVisible}
        >
          <View style={styles.container}>
            <View style={modalDimensions}>
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <FontedText style={styles.headerText}>
                    { this.props.title }
                  </FontedText>
                  <TouchableOpacity style={styles.closeButton}
                      activeOpacity={0.5}
                      onPress={() => this.props.setVisibility(false)}
                    >
                    <FontAwesome5Icon 
                      name="times-circle"
                      style={styles.closeIcon}
                    />
                  </TouchableOpacity>
                </View>
                
              </View>
              <View style={[styles.contentContainer, colorModes.contentBackgroundColorFor(this.props.inMuseumMode)]}>
                { this.props.children }
              </View>
            </View>
          </View>
        </Modal>

      </View>
    )
  }
}

const styles = EStyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: '$zooniverseTeal'
  },
  headerContent: {
    flexDirection: 'row',
    marginHorizontal: isTablet ? 25 : 10,
    marginVertical: 7,
  },
  headerText: {
    flex: 1,
    fontSize: isTablet ? 22 : 14,
    color: 'white',
    shadowColor: 'rgba(0, 0, 0, 0.22)',
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowRadius: 2
  },
  contentContainer: {
    flex: 1,
    padding: isTablet ? 30 : 20,
  },
  closeButton: {
    alignItems: 'flex-end'
  },
  closeIcon: {
    fontSize: isTablet ? 25 : 15,
    color: 'white',
    opacity: 0.9
  }
})

StyledModal.propTypes = {
  children: PropTypes.array,
  isVisible: PropTypes.bool,
  inMuseumMode: PropTypes.bool,
  setVisibility: PropTypes.func,
  title: PropTypes.string.isRequired,
  device: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number
  })
}

export default connect(mapStateToProps)(StyledModal)
