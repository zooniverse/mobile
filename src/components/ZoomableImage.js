import React from 'react'
import {
  Dimensions,
  Image,
} from 'react-native'
import ImageZoom from 'react-native-image-pan-zoom'
import PropTypes from 'prop-types';
import { connect } from 'react-redux'

const mapStateToProps = (state) => ({
  subjectDisplayHeight: state.main.device.subjectDisplayHeight
})

const ZoomableImage = (props) => {
  return (
    <ImageZoom
      cropWidth={Dimensions.get('window').width}
      cropHeight={Dimensions.get('window').height}
      imageWidth={Dimensions.get('window').width}
      imageHeight={props.subjectDisplayHeight}
      panToMove={ props.allowPanAndZoom }
      pinchToZoom={ props.allowPanAndZoom }
      onLongPress={props.handlePress}
      longPressTime={ 300 }>
      <Image
        source={ props.source }
        style={{width: Dimensions.get('window').width, height: props.subjectDisplayHeight}} 
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
  subjectDisplayHeight: PropTypes.number
}

export default connect(mapStateToProps)(ZoomableImage);
