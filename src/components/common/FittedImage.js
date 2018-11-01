import React, { Component } from 'react'
import {
    Image,
    View
} from 'react-native'
import PropTypes from 'prop-types'

class FittedImage extends Component {
    constructor(props) {
        super(props)

        this.state = {
            imageLayoutWidth: 1,
            imageLayoutHeight: 1,
            imageWidth: props.maxWidth,
            imageHeight: props.maxHeight,
        }
    }

    componentDidMount() {
        Image.getSize(this.props.source.uri, (width, height) => {
            this.setState({
                imageWidth: width,
                imageHeight: height,
            })
        })
    }

    componentDidUpdate(prevProps, prevState) {
        const propsDimensionsChanged = prevProps.maxWidth !== this.props.maxWidth || prevProps.maxHeight !== this.props.maxHeight
        const imageDimensionsCalculated = this.state.imageWidth !== prevState.imageWidth || this.state.imageHeight !== prevState.imageHeight
        if (propsDimensionsChanged || imageDimensionsCalculated) {
            const aspectRatio = Math.min(this.props.maxWidth / this.state.imageWidth, this.props.maxHeight / this.state.imageHeight)
            const resizedHeight = this.state.imageHeight * aspectRatio
            const resizedWidth = this.state.imageWidth * aspectRatio
            this.setState({
                imageWidth: resizedWidth,
                imageHeight: resizedHeight
            }, this.props.onLoad)
        }
    }

    render() {
        const imageStyle = {
            width: this.state.imageWidth,
            height: this.state.imageHeight,
        }
        const containerHeight = { height: this.state.imageHeight }

        return (
            <View style={ [containerHeight, styles.imageContainer] }>
                <Image
                    resizeMode="contain"
                    source={this.props.source}
                    style={imageStyle}
                />
            </View>
        )
    }
}

const styles = {
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
}

FittedImage.propTypes = {
    source: PropTypes.object,
    maxWidth: PropTypes.number,
    maxHeight: PropTypes.number,
    onLoad: PropTypes.func
}

export default FittedImage
