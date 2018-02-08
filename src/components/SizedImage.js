import React from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  Image,
} from 'react-native'
import PropTypes from 'prop-types';

class SizedImage extends React.Component {
  constructor(props) {
    super(props)
     this.state = {
       heightAnim: new Animated.Value(0),
       widthAnim: new Animated.Value(0),
       fadeAnim: new Animated.Value(0),
     }
  }

  componentWillMount() {
    this.animateImage()
  }

  animateImage() {
    const deviceWidth = Dimensions.get('window').width - 60
    const deviceHeight = Dimensions.get('window').height

    const imageDisplayWidth = this.props.maxWidth ? this.props.maxWidth : deviceWidth
    const imageDisplayHeight = this.props.maxHeight ? this.props.maxHeight : deviceHeight

    Image.getSize(this.props.source.uri, (width, height) => {
      const aspectRatio = Math.min(imageDisplayWidth / width, imageDisplayHeight / height)
      const resizedHeight = height * aspectRatio
      const resizedWidth = width * aspectRatio

      Animated.timing(
        this.state.heightAnim,
        {
          toValue: resizedHeight,
          easing: Easing.linear,
          duration: 50,
        }
      ).start()

      Animated.timing(
        this.state.widthAnim,
        {
          toValue: resizedWidth,
          easing: Easing.bezier(0, 1, 0.6, 1),
          duration: 50,
        }
      ).start()
    })
  }

  imageLoadEnd() {
    this.setState({ loading: false })
    Animated.timing(
      this.state.fadeAnim,
      { toValue: 1,
        duration: 200,
      },
    ).start();
  }


  render() {
    return (
      <Animated.Image
        source={ this.props.source }
        defaultSource={require('../../images/teal-wallpaper.png')}
        style={ [this.props.additionalStyles, {width: this.state.widthAnim, height: this.state.heightAnim, opacity: this.state.fadeAnim}] }
        onLoadEnd={ ()=>{ this.imageLoadEnd() } }
      />
    )
  }
}

SizedImage.propTypes = {
  source: PropTypes.object,
  maxWidth: PropTypes.number,
  maxHeight: PropTypes.number,
  additionalStyles: PropTypes.array
}

export default SizedImage
