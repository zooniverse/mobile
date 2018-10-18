import React, { Component } from 'react'
import {
    ImageBackground,
    Platform,
    View
} from 'react-native'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as drawingActions from '../../../actions/drawing'
import SvgOverlay from './SvgOverlay'

const mapStateToProps = (state) => {
    const { id } = state.classifier.subject
    return {
        shapes: state.drawing.shapesInProgress,
        subjectDimensions: state.classifier.subjectDimensions[id]
    }
}

const mapDispatchToProps = (dispatch) => ({
     drawingActions: bindActionCreators(drawingActions, dispatch)
})

class MarkableImage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            imageNativeWidth: 1,
            imageNativeHeight: 1,
            clientHeight: 1,
            clientWidth: 1,
            isImageLoaded: false
        }

        this.onShapeDeleted = this.onShapeDeleted.bind(this)
        this.onShapeCreated = this.onShapeCreated.bind(this)
        this.onShapeModified = this.onShapeModified.bind(this)
        this.onImageLayout = this.onImageLayout.bind(this)
    }

    onShapeDeleted(shapeIndex) {
        this.props.drawingActions.removeShapeAtIndex(shapeIndex)
    }

    onShapeCreated(newShape) {
        this.props.drawingActions.addShape(newShape)
    }

    onShapeModified(modifications, index) {
        this.props.drawingActions.mutateShapeAtIndex(modifications, index)
    }

    onImageLayout({nativeEvent}) {
        const { height: containerHeight, width: containerWidth } = nativeEvent.layout
        const { naturalHeight, naturalWidth } = this.props.subjectDimensions
        const aspectRatio = Math.min(containerHeight/naturalHeight, containerWidth/naturalWidth)
        const clientHeight = naturalHeight * aspectRatio
        const clientWidth = naturalWidth * aspectRatio
        this.setState({
            isImageLoaded: true,
            clientHeight,
            clientWidth,
        })
    }

    render() {
        const { naturalHeight, naturalWidth } = this.props.subjectDimensions
        const pathPrefix = Platform.OS === 'android' ? 'file://' : ''
        return (
            <View style={styles.svgContainer}>
                <ImageBackground 
                    onLayout={this.onImageLayout}
                    style={styles.svgOverlayContainer}
                    source={{uri: pathPrefix + this.props.source}}
                    resizeMode="contain"
                >
                    {
                        this.state.isImageLoaded ? 
                            <SvgOverlay
                                nativeWidth={naturalWidth}
                                nativeHeight={naturalHeight}
                                shapes={this.props.shapes}
                                color={this.props.drawingColor}
                                height={this.state.clientHeight}
                                width={this.state.clientWidth}
                                drawingShape="rect"
                                mode={this.props.mode}
                                onShapeCreated={this.onShapeCreated}
                                onShapeDeleted={this.onShapeDeleted}
                                onShapeModified={this.onShapeModified}
                            />
                        :
                            null
                    }
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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
}

MarkableImage.propTypes = {
    subjectDimensions: PropTypes.shape({
        naturalWidth: PropTypes.number,
        naturalHeight: PropTypes.number
    }),
    drawingColor: PropTypes.string,
    shapes: PropTypes.any,
    mode: PropTypes.oneOf(['draw', 'edit', 'erase', 'unselected']),
    drawingActions: PropTypes.shape({
        removeShapeAtIndex: PropTypes.func,
        addShape: PropTypes.func,
        mutateShapeAtIndex: PropTypes.func
    }),
    source: PropTypes.string,
}

export default connect(mapStateToProps, mapDispatchToProps)(MarkableImage)
