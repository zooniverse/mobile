import React from 'react'
import {
  Dimensions,
  Image
} from 'react-native'
import ImageZoom from 'react-native-image-pan-zoom'
import PropTypes from 'prop-types';

class ZoomableImage extends React.Component {
  constructor(props) {
    super(props)
     this.state = {
       height: 0,
       width: 0
     }
  }

  componentWillMount() {
    const deviceWidth = Dimensions.get('window').width
    const deviceHeight = Dimensions.get('window').height

    Image.getSize(this.props.source.uri, (width, height) => {
      const aspectRatio = Math.min(deviceWidth / width, deviceHeight / height)
      const resizedHeight = height * aspectRatio
      const resizedWidth = width * aspectRatio
      this.setState({ height: resizedHeight, width: resizedWidth })
    })
  }

  render() {
    return (
      <ImageZoom
        cropWidth={Dimensions.get('window').width}
        cropHeight={Dimensions.get('window').height}
        imageWidth={this.state.width}
        imageHeight={this.state.height}
        panToMove={ this.props.allowPanAndZoom }
        pinchToZoom={ this.props.allowPanAndZoom }
        onLongPress={this.props.handlePress}
        longPressTime={ 300 }>
        <Image
          source={ this.props.source }
          style={{width: this.state.width, height: this.state.height}} />
      </ImageZoom>
    )
  }
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
