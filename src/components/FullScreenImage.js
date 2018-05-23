import React from 'react'
import {
  Modal,
  TouchableOpacity,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import ZoomableImage from './ZoomableImage'
import Icon from 'react-native-vector-icons/FontAwesome'
import PropTypes from 'prop-types';

class FullScreenImage extends React.Component {
  render() {
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
          />
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
  source: PropTypes.object,
  isVisible: PropTypes.bool,
  handlePress: PropTypes.func,
}

export default FullScreenImage
