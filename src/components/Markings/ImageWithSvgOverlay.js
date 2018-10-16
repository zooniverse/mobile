import React, { Component } from 'react'
import {
    Image,
    Platform,
    View
} from 'react-native'
import PropTypes from 'prop-types'
import {
    Svg,
    Rect
} from 'react-native-svg'
import R from 'ramda'
import NativeImage from '../../nativeModules/NativeImage'
import SubjectLoadingIndicator from '../common/SubjectLoadingIndicator';

export default class ImageWithSvgOverlay extends Component {

    constructor(props) {
        super(props)
        this.count = 0
        this.state = {
            imageIsLoaded: false,
            imageNativeWidth: 1,
            imageNativeHeight: 1,
            imageResizedWidth: 1,
            imageResizedHeight: 1,
        }

        this.onImageLayout = this.onImageLayout.bind(this)
    }

    onImageLayout({nativeEvent}) {
        const { height: containerHeight, width: containerWidth } = nativeEvent.layout
        new NativeImage(this.props.uri).getImageSize().then(({width, height}) => {
            const aspectRatio = Math.min(containerHeight/height, containerWidth/width)
            this.setState({
                imageIsLoaded: true,
                imageResizedHeight: height * aspectRatio,
                imageResizedWidth: width * aspectRatio,
                imageNativeHeight: height,
                imageNativeWidth: width
            })
            
        })
    }

    renderShapes() {
        const shapeArray = []
        const convertObjectToComponent = (shape, index) => {
            const { type } = shape
            switch (type) {
                case ('rect'):
                    shapeArray.push(
                        <Rect 
                            key={index}
                            fill="transparent"
                            stroke={shape.color}
                            strokeWidth={3}
                            { ... shape }
                        />
                    )
            }
        }
        
        R.mapObjIndexed(convertObjectToComponent, this.props.shapes)
        return shapeArray
    }

    render() {
        const pathPrefix = Platform.OS === 'android' ? 'file://' : ''
        return (
            <View style={styles.container}>
                {this.props.imageIsLoaded ?
                    <View style={styles.container} >
                        <Image
                            onLayout={this.onImageLayout}
                            style={styles.backgroundImage}
                            source={{uri: pathPrefix + this.props.uri}}
                            resizeMode="contain"
                        />
                        {
                            this.state.imageIsLoaded ? 
                                <View style={styles.svgContainer} >
                                    <Svg 
                                        viewBox={`0 0 ${this.state.imageNativeWidth} ${this.state.imageNativeHeight}`}
                                        height={this.state.imageResizedHeight}
                                        width={this.state.imageResizedWidth}
                                    >
                                        { this.renderShapes() }
                                    </Svg>
                                </View>
                            : 
                                null
                        }
                    </View>
                :
                    <SubjectLoadingIndicator /> 
                }
            </View>
            
                
        )
    }
}

const styles = {
    container: {
        flex: 1
    },
    backgroundImage: {
        flex: 1,
        margin: 15,
        shadowColor: 'rgba(0,0,0,0.15)',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 1,
        shadowRadius: 20,
    },
    svgContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    }
}

ImageWithSvgOverlay.propTypes = {
    imageIsLoaded: PropTypes.bool,
    uri: PropTypes.string,
    annotations: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.oneOf(['square']),
        color: PropTypes.string,
        x: PropTypes.number,
        y: PropTypes.number,
        width: PropTypes.number,
        height: PropTypes.number
    })),
    shapes: PropTypes.object
}