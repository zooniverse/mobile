import React from 'react'
import {
  Dimensions,
  Image,
} from 'react-native'
import ImageZoom from 'react-native-image-pan-zoom'
import PropTypes from 'prop-types';

const ZoomableImage = (props) => {
  return (
    <ImageZoom
      cropWidth={Dimensions.get('window').width}
      cropHeight={Dimensions.get('window').height}
      imageWidth={Dimensions.get('window').width}
      imageHeight={Dimensions.get('window').height/2}
      panToMove={ props.allowPanAndZoom }
      pinchToZoom={ props.allowPanAndZoom }
      onLongPress={props.handlePress}
      longPressTime={ 300 }>
      <Image
        source={ props.source }
        style={{width: Dimensions.get('window').width, height: Dimensions.get('window').height/2}} 
        resizeMethod="resize"
      />
    </ImageZoom>
  )
}


ZoomableImage.propTypes = {
  source: PropTypes.shape({
    uri: PropTypes.string,
  }),
  handlePress: PropTypes.func,
  imageWidth: PropTypes.number,
  imageHeight: PropTypes.number,
  allowPanAndZoom: PropTypes.bool,
}

export default ZoomableImage
