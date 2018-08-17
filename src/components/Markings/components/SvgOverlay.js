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
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as drawingScreenAction from '../../../actions/drawingScreen'

const INITIAL_SQUARE_SIDE = 2

const mapStateToProps = (state) => ({
        shapes: state.drawingScreen.shapes
})

const mapDispatchToProps = (dispatch) => ({
    drawingScreenActions: bindActionCreators(drawingScreenAction, dispatch)
})

/**
 * This class sits over the image and has 3 different stats
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
                const { dx, dy } = gestureState
                this.widthAnimated.setValue(INITIAL_SQUARE_SIDE + dx)
                this.heightAnimated.setValue(INITIAL_SQUARE_SIDE + dy)
            },
            onPanResponderTerminationRequest: () => true,
            onPanResponderRelease: (evt, gestureState) => {
                const { previewSquareX, previewSquareY } = this.state
                const { dx, dy } = gestureState
                const shape = {
                    type: 'square',
                    color: this.props.color,
                    x: previewSquareX,
                    y: previewSquareY,
                    width: INITIAL_SQUARE_SIDE + dx,
                    height: INITIAL_SQUARE_SIDE + dy
                }

                this.setState({ isDrawing: false })
                this.props.drawingScreenActions.addShape(shape)
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
                case ('square'):
                    shapeArray.push(
                        <DragableSquare 
                            key={index} 
                            index={index}
                            isEditable={this.props.mode === 'edit'}
                            isDeletable={this.props.mode === 'erase'}
                            onDelete={() => {
                                this.props.drawingScreenActions.removeShapeAtIndex(index)
                            }}
                        />
                    )
            }
        }
        
        R.mapObjIndexed(convertObjectToComponent, this.props.shapes)
        return shapeArray
    }

    renderPreviewShape() {
        switch (this.props.shape) {
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
    color: PropTypes.string,
    shape: PropTypes.oneOf(['rect']),
    mode: PropTypes.oneOf(['draw', 'edit', 'erase']),
    shapes: PropTypes.object,
    drawingScreenActions: PropTypes.object
}

SvgOverlay.defaultProps = {
    color: 'black'
}

export default connect(mapStateToProps, mapDispatchToProps)(SvgOverlay)
