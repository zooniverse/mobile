import React, { Component } from 'react'
import {
    ImageBackground,
    Platform,
    View
} from 'react-native'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
// import * as drawingScreenAction from '../../../actions/drawingScreen'
import SvgOverlay from './SvgOverlay'
import NativeImage from '../../../nativeModules/NativeImage'

// const mapStateToProps = (state) => ({
    // shapes: state.drawingScreen.shapes
// })

// const mapDispatchToProps = (dispatch) => ({
//      drawingScreenActions: bindActionCreators(drawingScreenAction, dispatch)
// })

class MarkableImage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            mode: 'edit',
            imageResizedHeight: 1,
            imageResizedWidth: 1
        }

        // this.onShapeDeleted = this.onShapeDeleted.bind(this)
        // this.onShapeCreated = this.onShapeCreated.bind(this)
        // this.onShapeModified = this.onShapeModified.bind(this)
        this.onImageLayout = this.onImageLayout.bind(this)
    }

    // onShapeDeleted(shapeIndex) {
    //     this.props.drawingScreenActions.removeShapeAtIndex(shapeIndex)
    // }

    // onShapeCreated(newShape) {
    //     this.props.drawingScreenActions.addShape(newShape)
    // }

    // onShapeModified(modifications, index) {
    //     this.props.drawingScreenActions.mutateShapeAtIndex(modifications, index)
    // }

    onImageLayout({nativeEvent}) {
        const { height: containerHeight, width: containerWidth } = nativeEvent.layout
        new NativeImage(this.props.source).getImageSize().then(({width, height}) => {
            const aspectRatio = Math.min(containerHeight/height, containerWidth/width)
            this.setState({
                imageResizedHeight: height * aspectRatio,
                imageResizedWidth: width * aspectRatio
            })
            
        })
    }

    render() {
        const pathPrefix = Platform.OS === 'android' ? 'file://' : ''
        return (
            <View style={styles.svgContainer}>
                <ImageBackground 
                    onLayout={this.onImageLayout}
                    style={styles.svgOverlayContainer}
                    source={{uri: pathPrefix + this.props.source}}
                    resizeMode="contain"
                >
                    <SvgOverlay
                        height={`${this.state.imageResizedHeight}`}
                        width={`${this.state.imageResizedWidth}`}
                        shape="rect"
                        mode={this.state.mode}
                        onShapeCreated={this.onShapeCreated}
                        onShapeDeleted={this.onShapeDeleted}
                        onShapeModified={this.onShapeModified}
                    />
                </ImageBackground>
            </View>
        )
    }

}

const styles = {
    svgContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    svgOverlayContainer: {
        flex: 1
    },
}

MarkableImage.propTypes = {
    drawingScreenActions: PropTypes.shape({
        removeShapeAtIndex: PropTypes.func,
        addShape: PropTypes.func,
        mutateShapeAtIndex: PropTypes.func
    }),
    source: PropTypes.string,
}

export default connect(null, null)(MarkableImage)
