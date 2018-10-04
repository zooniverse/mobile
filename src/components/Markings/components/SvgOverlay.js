import React, { Component } from 'react'
import {
    Animated,
    PanResponder
} from 'react-native'
import {
    Svg,
    Rect,
} from 'react-native-svg'
import PropTypes from 'prop-types'
import DragableSquare from './DragableSquare'
import R from 'ramda'
import {
    distanceFromRange
} from '../../../utils/drawingUtils'

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
            overlayHeight: 0,
            overlayWidth: 0
        }

        this.widthAnimated = new Animated.Value(INITIAL_SQUARE_SIDE)
        this.widthAnimated.addListener( ({value}) => {
            this.drawingRect.setNativeProps({
                width: `${value}`
            })
        })

        this.heightAnimated = new Animated.Value(INITIAL_SQUARE_SIDE),
        this.heightAnimated.addListener( ({value}) => {
            this.drawingRect.setNativeProps({
                height: `${value}`
            })
        })

        this.panResponder = PanResponder.create({
            // Ask to be the responder:
            onStartShouldSetPanResponder: () => {return this.props.mode === 'draw' },
            onStartShouldSetPanResponderCapture: () => {return this.props.mode === 'draw'},
            onMoveShouldSetPanResponder: () => {return this.props.mode === 'draw'},
            onMoveShouldSetPanResponderCapture: () => {return this.props.mode === 'draw'},
            onPanResponderGrant: (evt) => {
                const { locationX, locationY } = evt.nativeEvent
                this.setState({
                    isDrawing: true,
                    previewSquareX: locationX - INITIAL_SQUARE_SIDE,
                    previewSquareY: locationY - INITIAL_SQUARE_SIDE
                })
            },
            onPanResponderMove: (evt, gestureState) => {
                const { locationY } = evt.nativeEvent
                const { dx, dy } = gestureState
                this.widthAnimated.setValue(INITIAL_SQUARE_SIDE + dx)
                this.heightAnimated.setValue(INITIAL_SQUARE_SIDE + dy - distanceFromRange(locationY, 0,this.state.overlayHeight))
            },
            onPanResponderTerminationRequest: () => true,
            onPanResponderRelease: (evt, gestureState) => {
                const { previewSquareX, previewSquareY } = this.state
                const { dx, dy } = gestureState
                const { locationY } = evt.nativeEvent
                const shapeWidth = INITIAL_SQUARE_SIDE + dx
                const shapeHeight = INITIAL_SQUARE_SIDE + dy - distanceFromRange(locationY, 0,this.state.overlayHeight)
                const shape = {
                    type: 'rect',
                    color: this.props.drawingColor,
                    x: previewSquareX,
                    y: previewSquareY,
                    width: shapeWidth,
                    height: shapeHeight
                }

                this.setState({ isDrawing: false })
                
                if (Math.abs(shapeWidth) > 20 || Math.abs(shapeHeight) > 20) {
                    this.props
                }
            },
            onPanResponderTerminate: () => {
                this.setState({
                    squareWidth: INITIAL_SQUARE_SIDE,
                    squareHeight: INITIAL_SQUARE_SIDE,
                    isDrawing: false,
                })


            },
            onShouldBlockNativeResponder: () => true
          });
    }

    renderShapes() {
        const shapeArray = []
        const convertObjectToComponent = (shape, index) => {
            const { type } = shape
            switch (type) {
                case ('rect'):
                    shapeArray.push(
                        <DragableSquare 
                            key={index} 
                            index={index}
                            isEditable={this.props.mode === 'edit'}
                            isDeletable={this.props.mode === 'erase'}
                            containerHeight={this.state.overlayHeight}
                            containerWidth={this.state.overlayWidth}
                            onDelete={() => {
                                this.props.onShapeDeleted(index)
                            }}
                            { ... shape }
                        />
                    )
            }
        }
        
        R.mapObjIndexed(convertObjectToComponent, this.props.shapes)
        return shapeArray
    }

    renderPreviewShape() {
        switch (this.props.drawingShape) {
            case 'rect':
                return (
                    <Rect 
                        ref={ref => this.drawingRect = ref}
                        stroke="black"
                        strokeWidth={3}
                        fill="rgba(0, 0, 0, .5)"
                        x={this.state.previewSquareX} 
                        y={this.state.previewSquareY} 
                    />
                )
            default: 
                return null
        }
    }

    render() {
        return (
            <Svg
                { ...this.panResponder.panHandlers }
                onLayout={({nativeEvent})=> {
                    const { height, width } = nativeEvent.layout
                    this.setState({
                        overlayHeight: height,
                        overlayWidth: width
                    })
                }}
                style={styles.svg}
                preserveAspectRatio="xMidYMid meet"
            >
                { this.state.isDrawing ? 
                    this.renderPreviewShape()
                    : null
                }
                {this.renderShapes()}
            </Svg>
        )
    }
}

const styles = {
    svg: {
        flex: 1
    }
}

SvgOverlay.propTypes = {
    drawingColor: PropTypes.string,
    drawingShape: PropTypes.oneOf(['rect']),
    shapes: PropTypes.object,
    mode: PropTypes.oneOf(['draw', 'edit', 'erase']),
    onShapeDeleted: PropTypes.func,
    onShapeCreated: PropTypes.func,
    onShapeModified: PropTypes.func
}

SvgOverlay.defaultProps = {
    color: 'black'
}

export default SvgOverlay
