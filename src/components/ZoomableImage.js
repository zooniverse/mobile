import React from 'react'
import {
  Dimensions,
  Image,
} from 'react-native'
import ImageZoom from 'react-native-image-pan-zoom'
import PropTypes from 'prop-types';

export const ZoomableImage = (props) => {
  return (
    <ImageZoom
      cropWidth={Dimensions.get('window').width}
      cropHeight={Dimensions.get('window').height}
      imageWidth={Dimensions.get('window').width}
      imageHeight={Dimensions.get('window').height}
      panToMove={ props.allowPanAndZoom }
      onLongPress={props.handlePress}
      longPressTime={ 300 }
      pinchToZoom
    >
      <Image
        source={ props.source }
        style={{width: Dimensions.get('window').width, height: Dimensions.get('window').height}} 
        resizeMethod="resize"
        resizeMode="contain"
      />
    </ImageZoom>
  )
}


ZoomableImage.propTypes = {
  source: PropTypes.shape({
    uri: PropTypes.string,
  }),
  handlePress: PropTypes.func,
}

export default ZoomableImage