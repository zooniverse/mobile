import React, { Component } from 'react'
import {
  Dimensions,
  Image,
  Platform
} from 'react-native'
import ImageZoom from 'react-native-image-pan-zoom'
import PropTypes from 'prop-types';
import { connect } from 'react-redux'

const mapStateToProps = (state) => ({
  images: state.images
})

export class ZoomableImage extends Component {
  render() {
    let uri = this.props.uri
    if (this.props.images[this.props.uri]) {
      const pathPrefix = Platform.OS === 'android' ? 'file://' : ''
      uri = pathPrefix + this.props.images[this.props.uri]
    }
    
    return (
      <ImageZoom
        cropWidth={Dimensions.get('window').width}
        cropHeight={Dimensions.get('window').height}
        imageWidth={Dimensions.get('window').width - 50}
        imageHeight={Dimensions.get('window').height - 50}
        onLongPress={this.props.handlePress}
        longPressTime={ 300 }
        pinchToZoom
        panToMove
      >
        <Image
          source={{ uri }}
          style={{width: Dimensions.get('window').width - 50, height: Dimensions.get('window').height - 50}} 
          resizeMethod="resize"
          resizeMode="contain"
        />
      </ImageZoom>
    )
  }
}


ZoomableImage.propTypes = {
  uri: PropTypes.string,
  handlePress: PropTypes.func,
  images: PropTypes.object
}

export default connect(mapStateToProps)(ZoomableImage)