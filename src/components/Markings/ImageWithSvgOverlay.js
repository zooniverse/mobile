import React, { Component } from 'react'
import {
    Animated,
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
import { BlurView } from 'react-native-blur';
import Icon from 'react-native-vector-icons/FontAwesome'
import SubjectLoadingIndicator from '../common/SubjectLoadingIndicator';

class ImageWithSvgOverlay extends Component {

    constructor(props) {
        super(props)

        this.state = {
            scale: new Animated.Value(1),
            containerDimensions: {
                width: 1,
                height: 1
            },
        }

        this.onImageLayout = this.onImageLayout.bind(this)
        this.animateScale = this.animateScale.bind(this)
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.imageIsLoaded !== this.props.imageIsLoaded && !this.props.imageIsLoaded) {
            this.setState({scale: new Animated.Value(0.8)})
        }
        if (!R.equals(prevProps.subjectDimensions, this.props.subjectDimensions) || !R.equals(prevState.containerDimensions, this.state.containerDimensions)) {
            const { naturalHeight, naturalWidth } = this.props.subjectDimensions
            const { height: containerHeight, width: containerWidth } = this.state.containerDimensions
            const aspectRatio = Math.min(containerHeight/naturalHeight, containerWidth/naturalWidth)
            const clientHeight = naturalHeight * aspectRatio
            const clientWidth = naturalWidth * aspectRatio

            this.props.onImageLayout({
                clientHeight,
                clientWidth,
            })
        }
    }

    animateScale() {
        Animated.spring(
            this.state.scale,
            {
                toValue: 1
            }
        ).start()
    }

    onImageLayout({nativeEvent}) {
        const { height, width } = nativeEvent.layout
        this.setState({
            containerDimensions: {
                width,
                height
            }
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
                            strokeWidth={4 * this.props.displayToNativeRatio}
                            { ... shape }
                        />
                    )
            }
        }
        
        R.mapObjIndexed(convertObjectToComponent, this.props.shapes)
        return shapeArray
    }

    renderBlurView() {
        const expandIcon = <Icon name="arrows-alt" color="white" size={50} />

        return (
            <View style={styles.blurView}>
                {
                    Platform.OS === 'ios' ?
                        <BlurView style={[styles.centeredContent, this.state.containerDimensions]} blurType="light" blurAmount={2}>
                            { expandIcon }
                        </BlurView>

                    :
                        <View style={ [styles.centeredContent, styles.androidBlurView, this.state.containerDimensions] }>
                            { expandIcon }
                        </View>
                }
            </View>
        )
    }

    render() {
        const pathPrefix = Platform.OS === 'android' ? 'file://' : ''
        const { naturalWidth, naturalHeight } = this.props.subjectDimensions

        return (
            <Animated.View style={[styles.container, {transform: [{scale: this.state.scale}]}]}>
                {this.props.imageIsLoaded ?
                    <View style={styles.container} >
                        <Image
                            onLoad={() => this.animateScale()}
                            onLayout={this.onImageLayout}
                            style={styles.backgroundImage}
                            source={{uri: pathPrefix + this.props.uri}}
                            resizeMode="contain"
                        />
                        <View style={styles.svgContainer} >
                            <Svg 
                                viewBox={`0 0 ${naturalWidth} ${naturalHeight}`}
                                height={this.state.containerDimensions.height}
                                width={this.state.containerDimensions.width}
                            >
                                { this.renderShapes() }
                            </Svg>
                        </View>
                    </View>
                :
                    <SubjectLoadingIndicator /> 
                }
                { this.props.showBlurView && this.props.imageIsLoaded && this.renderBlurView()}
            </Animated.View>               
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
    },
    blurView: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },
    centeredContent: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
    },
    androidBlurView: {
        backgroundColor: 'rgba(255, 255, 255, 0.4)'
    },
}

ImageWithSvgOverlay.propTypes = {
    subjectDimensions: PropTypes.shape({
        naturalWidth: PropTypes.number,
        naturalHeight: PropTypes.number
    }),
    displayToNativeRatio: PropTypes.number,
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
    onImageLayout: PropTypes.func,
    shapes: PropTypes.object,
    showBlurView: PropTypes.bool
}

export default ImageWithSvgOverlay