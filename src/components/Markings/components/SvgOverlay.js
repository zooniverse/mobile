import React, { Component } from 'react'
import {
    PanResponder,
    View
} from 'react-native'
import {
    Svg,
    Rect,
} from 'react-native-svg'
import PropTypes from 'prop-types'
import {
    distanceFromRange
} from '../../../utils/drawingUtils'
import ShapeEditorSvg from './ShapeEditorSvg'

const INITIAL_SQUARE_SIDE = 2

/**
 * This class sits over the image and has 3 different modes
 *
 * Draw - The Svg layer responds to pan gestures and will draw shapes based on the users inputs.
 *        Please not there are two different SVGs that get drawn. The preview shapes and the actual shape.
 *        The preview shapes are just feedback for the shape the user will draw
 *
 * Edit - The shapes drawn become editable. The user may move the shapes and change its size.
 *
 * Delete - The shape becomes deletable.
 */
class SvgOverlay extends Component {

    constructor(props) {
        super(props)
        this.count = 0

        this.state = {
            isDrawing: false,
            previewSquareX: 0,
            previewSquareY: 0,
            previewSquareWidth: INITIAL_SQUARE_SIDE,
            previewSquareHeight: INITIAL_SQUARE_SIDE,
            // These values are the ratios of the the images display sizes to the images native size
            displayToNativeRatioX: props.nativeWidth / props.width,
            displayToNativeRatioY: props.nativeHeight / props.height
        }

        this.onShapeEdited = this.onShapeEdited.bind(this)
        this.onShapeDeleted = this.onShapeDeleted.bind(this)
        this.onShapeCreated = this.onShapeCreated.bind(this)
    }

    componentDidUpdate(prevProps) {
        const sizeChange =
            prevProps.width !== this.props.width ||
            prevProps.height !== this.props.height ||
            prevProps.nativeWidth !== this.props.nativeWidth ||
            prevProps.nativeHeight !== this.props.nativeHeight

        if (sizeChange) {
            this.setState({
                displayToNativeRatioX: this.props.nativeWidth / this.props.width,
                displayToNativeRatioY: this.props.nativeHeight / this.props.height
            })
        }
    }

    onShapeCreated(shapeDimensions) {
        const shape = {
            type: 'rect',
            color: this.props.color,
            ...shapeDimensions
        }

        if (Math.abs(shapeDimensions.width) > (20 * this.state.displayToNativeRatioX) || Math.abs(shapeDimensions.height) > (20 * this.state.displayToNativeRatioY)) {
            this.props.onShapeCreated(shape)
        }
    }

    render() {
        const sizeStyle = { height: this.props.height, width: this.props.width }
        return (
            <View style={sizeStyle} >
                <View style={[styles.absolute, sizeStyle]}>
                    <ShapeEditorSvg
                        viewBox={`0 0 ${this.props.nativeWidth} ${this.props.nativeHeight}`}
                        height={this.props.height}
                        width={this.props.width}
                        shapes={this.props.shapes}
                        nativeWidth={this.props.nativeWidth}
                        mode={this.props.mode}
                        onShapeEdited={this.onShapeEdited}
                        onShapeDeleted={this.onShapeDeleted}
                        onShapeCreated={this.onShapeCreated}
                        displayToNativeRatioX={this.state.displayToNativeRatioX}
                        displayToNativeRatioY={this.state.displayToNativeRatioY}
                        drawingShape={this.props.drawingShape}
                        onShapeIsOutOfBoundsUpdates={this.props.onShapeIsOutOfBoundsUpdates}
                        maxShapesDrawn={this.props.maxShapesDrawn}
                    />
                </View>
            </View>
        )
    }

    onShapeEdited(shapeIndex, { dx, dy, dw, dh }) {
        this.props.onShapeModified({
            dx,
            dy,
            dw,
            dh
        }, shapeIndex)
    }

    onShapeDeleted(shapeIndex) {
        this.props.onShapeDeleted(shapeIndex)
    }
}

const styles = {
    absolute: {
        position: 'absolute'
    }
}

SvgOverlay.propTypes = {
    height: PropTypes.number,
    width: PropTypes.number,
    nativeWidth: PropTypes.number,
    nativeHeight: PropTypes.number,
    color: PropTypes.string,
    drawingShape: PropTypes.oneOf(['rect']),
    shapes: PropTypes.object,
    maxShapesDrawn: PropTypes.bool,
    mode: PropTypes.oneOf(['draw', 'erase', 'view']),
    onShapeDeleted: PropTypes.func,
    onShapeCreated: PropTypes.func,
    onShapeModified: PropTypes.func,
    onShapeIsOutOfBoundsUpdates: PropTypes.func,
}

SvgOverlay.defaultProps = {
    color: 'black'
}

export default SvgOverlay
