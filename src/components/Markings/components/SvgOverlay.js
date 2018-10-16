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
import R from 'ramda'
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
            displayToNativeRatioX: props.nativeWidth/props.width,
            displayToNativeRatioY: props.nativeHeight/props.height
        }

        this.panResponder = PanResponder.create({
            // Ask to be the responder:
            onStartShouldSetPanResponder: () => {this.props.mode === 'draw'},
            onStartShouldSetPanResponderCapture: () => {return this.props.mode === 'draw'},
            onMoveShouldSetPanResponder: () => { return this.props.mode === 'draw' },
            onMoveShouldSetPanResponderCapture: () => { return this.props.mode === 'draw'},
            onPanResponderGrant: (evt) => {
                const { locationX, locationY } = evt.nativeEvent
                this.setState({
                    isDrawing: true,
                    previewSquareX: (locationX - INITIAL_SQUARE_SIDE) * this.state.displayToNativeRatioX,
                    previewSquareY: (locationY - INITIAL_SQUARE_SIDE) * this.state.displayToNativeRatioY
                })
            },
            onPanResponderMove: (evt, gestureState) => {
                const { locationY } = evt.nativeEvent
                const { dx, dy } = gestureState
                this.setState({
                    previewSquareWidth: (INITIAL_SQUARE_SIDE + dx) * this.state.displayToNativeRatioX,
                    previewSquareHeight: (INITIAL_SQUARE_SIDE + dy - distanceFromRange(locationY, 0, this.props.height)) * this.state.displayToNativeRatioY
                })
            },
            onPanResponderTerminationRequest: () => true,
            onPanResponderRelease: (evt, gestureState) => {
                const { displayToNativeRatioX, displayToNativeRatioY, previewSquareX, previewSquareY } = this.state
                const { dx, dy } = gestureState
                const { locationY } = evt.nativeEvent
                const shapeWidth = (INITIAL_SQUARE_SIDE + dx) * displayToNativeRatioX
                const shapeHeight = (INITIAL_SQUARE_SIDE + dy - distanceFromRange(locationY, 0, this.props.height)) * displayToNativeRatioY
                const shape = {
                    type: 'rect',
                    color: this.props.color,
                    x: previewSquareX,
                    y: previewSquareY,
                    width: shapeWidth,
                    height: shapeHeight
                }

                this.setState({ 
                    isDrawing: false,
                    previewSquareWidth: INITIAL_SQUARE_SIDE,
                    previewSquareHeight: INITIAL_SQUARE_SIDE,
                    previewSquareX: 0,
                    previewSquareY: 0
                })
                
                if (Math.abs(shapeWidth) > 20 || Math.abs(shapeHeight) > 20) {
                    this.props.onShapeCreated(shape)
                }
            },
            onPanResponderTerminate: () => {
                this.setState({
                    squareWidth: INITIAL_SQUARE_SIDE,
                    squareHeight: INITIAL_SQUARE_SIDE,
                    isDrawing: false,
                })


            },
            onShouldBlockNativeResponder: () => false
          });
          
          this.onShapeEdited = this.onShapeEdited.bind(this)
          this.onShapeDeleted = this.onShapeDeleted.bind(this)
    }

    componentDidUpdate(prevProps) {
        const sizeChange = 
            prevProps.width !== this.props.width ||
            prevProps.height !== this.props.height ||
            prevProps.nativeWidth !== this.props.nativeWidth ||
            prevProps.nativeHeight !== this.props.nativeHeight

        if (sizeChange) {
            this.setState({
                displayToNativeRatioX: this.props.nativeWidth/this.props.width,
                displayToNativeRatioY: this.props.nativeHeight/this.props.height
            })
        }
    }

    renderPreviewShape() {
        switch (this.props.drawingShape) {
            case 'rect':
                return (
                    <Rect 
                        stroke="black"
                        strokeWidth={3}
                        fill="rgba(0, 0, 0, .5)"
                        x={this.state.previewSquareX} 
                        y={this.state.previewSquareY}
                        width={this.state.previewSquareWidth}
                        height={this.state.previewSquareHeight}
                    />
                )
            default: 
                return null
        }
    }

    render() {
        const sizeStyle = {height: this.props.height, width: this.props.width}
        return (
            <View {...this.panResponder.panHandlers} style={sizeStyle} >
                {
                    this.props.mode === 'draw' ? 
                        <Svg
                            viewBox={`0 0 ${this.props.nativeWidth} ${this.props.nativeHeight}`}
                            height={this.props.height}
                            width={this.props.width}
                        >
                            {this.state.isDrawing ? this.renderPreviewShape(): null }
                        </Svg>
                    : null
                }
                <View style={[styles.absolute, sizeStyle]}>
                    <ShapeEditorSvg 
                        viewBox={`0 0 ${this.props.nativeWidth} ${this.props.nativeHeight}`}
                        height={this.props.height}
                        width={this.props.width}
                        shapes={this.props.shapes}
                        mode={this.props.mode}
                        onShapeEdited={this.onShapeEdited}
                        onShapeDeleted={this.onShapeDeleted}
                        displayToNativeRatioX={this.state.displayToNativeRatioX}
                        displayToNativeRatioY={this.state.displayToNativeRatioY}
                    />
                </View>
            </View>
        )
    }

    onShapeEdited(shapeIndex, touchState, {dx, dy, dw, dh}) {
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
    mode: PropTypes.oneOf(['draw', 'edit', 'erase', 'unselected']),
    onShapeDeleted: PropTypes.func,
    onShapeCreated: PropTypes.func,
    onShapeModified: PropTypes.func
}

SvgOverlay.defaultProps = {
    color: 'black'
}

export default SvgOverlay
