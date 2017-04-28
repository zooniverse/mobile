import React from 'react'
import {
  Modal,
  TouchableOpacity,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import ZoomableImage from './ZoomableImage'
import Icon from 'react-native-vector-icons/FontAwesome'
import StyledText from './StyledText'

class FullScreenImage extends React.Component {
  render() {
    const zoomMessage =
      <View style={styles.rowContainer}>
        <Icon name="info-circle" style={styles.infoIcon} />
        <StyledText additionalStyles={[styles.message]} text='You can zoom into this image' />
      </View>

    return (
      <Modal
        animationType={'fade'}
        transparent={true}
        onRequestClose={() => {}}
        visible={this.props.isVisible}>
        <View style={styles.container}>
          <ZoomableImage
            source={this.props.source}
            handlePress={this.props.handlePress}
            allowPanAndZoom={!!this.props.allowPanAndZoom} />
          {this.props.allowPanAndZoom ? zoomMessage : null}
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={this.props.handlePress}
            style={styles.closeIcon}>
            <Icon name="times" style={styles.icon} />
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  closeIcon: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 13,
    right: 5
  },
  icon: {
    backgroundColor: 'transparent',
    color: 'white',
    fontSize: 24,
    padding: 15,
  },
  rowContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  message: {
    color: 'white',
  },
  infoIcon: {
    color: '$transluscentWhite',
    fontSize: 20,
    padding: 5,
  }
})

FullScreenImage.propTypes = {
  source: React.PropTypes.object,
  isVisible: React.PropTypes.bool,
  handlePress: React.PropTypes.func,
  allowPanAndZoom: React.PropTypes.bool
}

export default FullScreenImage
