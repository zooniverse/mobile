import React, { Component } from 'react'
import {
    PanResponder,
    View
} from 'react-native'
import { 
    Rect,
    Svg,
} from 'react-native-svg'
import R from 'ramda'
import PropTypes from 'prop-types'
import EditableRect from './EditableRect'
import {
    analyzeCoordinateWithShape,
    calculateShapeChanges,
    isCoordinateWithinSquare,
    isShapeOutOfBounds,
    drawingTouchState
} from '../../../utils/shapeUtils'

/**
 * This class handles all user interactions with shapes.
 * 
 * Because of some oddities with Pan Responders and Svgs in modals, 
 * we need to tackle this problem in a somewhat round-about way.
 * 
 * Essentially every time a shape gets rendered we save its location, 
 * its corner locations and its close Svg location. 
 * 
 * When the user interacts with the pan responder, we determine based on the saved
 * location data if/which shape the user is touching. 
 */

const INITIAL_PREVIEW_SHAPE_SIDE = 2

class ShapeEditorSvg extends Component {

    previewShapeInitialDimensions() {
        return {
            x: 0,
            y: 0,
            width: INITIAL_PREVIEW_SHAPE_SIDE * this.props.displayToNativeRatioX,
            height: INITIAL_PREVIEW_SHAPE_SIDE * this.props.displayToNativeRatioY
        }
    }

    constructor(props) {
        super(props)

        this.shapeLocations = {}
        this.cornerLocations = {}
        this.closeLocations = {}
        this.shapeRefs = {}

        this.state = {
            shapeIndex: -1,
            shapeToRemoveIndex: -1,
            touchState: {
                bottomLeft: false,
                bottomRight: false,
                upperLeft: false,
                upperRight: false,
                perimeterOnly: false
            },
            isDrawing: false,
            dragOrigin: { x: 0, y: 0},
            previewShapeDimensions: this.previewShapeInitialDimensions()
        }

        this.erasePanResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => this.props.mode === 'erase',
            onStartShouldSetPanResponderCapture: () => this.props.mode === 'erase',
            onMoveShouldSetPanResponder: () => this.props.mode === 'erase',
            onMoveShouldSetPanResponderCapture: () => this.props.mode === 'erase',
            onPanResponderGrant: (evt) => {
                const { locationX, locationY } = evt.nativeEvent
                let keyToDelete = null
                R.forEachObjIndexed((closeShape, key) => {
                    if (isCoordinateWithinSquare(locationX, locationY, closeShape)) {
                        keyToDelete = key
                    }
                }, this.closeLocations)
                this.deleteShapeWithKey(keyToDelete)
            }
        })

        this.editPanResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => this.props.mode === 'draw',
            onStartShouldSetPanResponderCapture: () => this.props.mode === 'draw',
            onMoveShouldSetPanResponder: () => this.props.mode === 'draw',
            onMoveShouldSetPanResponderCapture: () => this.props.mode === 'draw',
            onPanResponderGrant: (evt) => {
                // We save The drag origin to later calculate if our drag goes out of bounds
                const { locationX, locationY } = evt.nativeEvent
                this.setState({
                    dragOrigin: { x: locationX, y: locationY },
                })

                // Determine if the user is touching a shape and where in the shape they are touching
                const analyzedLocations = R.mapObjIndexed((shape, key) => {
                    return analyzeCoordinateWithShape(locationX, locationY, shape, this.cornerLocations[key])
                }, this.shapeLocations)
                const allShapesTouched = R.pickBy((analysis) => analysis.withinSquare, analyzedLocations)
                
                // If a shape is being touched, update state with where it's being touched
                if (R.keys(allShapesTouched).length > 0) {
                    const touchedShapeIndex = R.keys(allShapesTouched)[0]
                    const touchedSquare = allShapesTouched[touchedShapeIndex]
                    this.setState({
                        shapeIndex: touchedShapeIndex,
                        touchState: touchedSquare
                    })
                }

                // If a shape isn't being touched, then we should begin drawing a new shape 
                else if (!this.props.maxShapesDrawn) {
                    const previewShapeDimensions = R.merge(this.state.previewShapeDimensions, {
                        x: (locationX - INITIAL_PREVIEW_SHAPE_SIDE) * this.props.displayToNativeRatioX,
                        y: (locationY - INITIAL_PREVIEW_SHAPE_SIDE) * this.props.displayToNativeRatioY,
                    })
                    this.setState({
                        isDrawing: true,
                        previewShapeDimensions
                    })
                }
            },
            onPanResponderMove: (evt, gestureState) => {
                const { shapeIndex, touchState, isDrawing } = this.state
                const { dx, dy } = gestureState
                const dragLocation = {
                    x: this.state.dragOrigin.x + dx,
                    y: this.state.dragOrigin.y + dy
                }

                if (shapeIndex >= 0) {
                    const shape = this.props.shapes[shapeIndex]
                    const deltas = calculateShapeChanges(touchState, dx, dy, 
                                                         this.props.displayToNativeRatioX, this.props.displayToNativeRatioY,
                                                         shape, this.props.width, this.props.height, dragLocation)

                    // Because Svgs don't have any way to animate, we have to update their props manually
                    const newDimensions = this.shapeRefs[shapeIndex].update(deltas);
                    const shapeIsOutOfBounds = isShapeOutOfBounds(newDimensions, {width: this.props.width *this.props.displayToNativeRatioX, height: this.props.height * this.props.displayToNativeRatioY})
                    const shapeIsOutOfBoundsAndBeingDragged = shapeIsOutOfBounds && touchState.perimeterOnly
                    this.props.onShapeIsOutOfBoundsUpdates(shapeIsOutOfBoundsAndBeingDragged)
                    this.setState({
                        shapeToRemoveIndex: shapeIsOutOfBoundsAndBeingDragged ? shapeIndex : -1
                    })
                } 
                
                if (isDrawing) {
                    const previewShapeStartDimensions = R.merge(this.state.previewShapeDimensions, {width: 0, height: 0})

                    const deltas = calculateShapeChanges(drawingTouchState, dx + INITIAL_PREVIEW_SHAPE_SIDE, dy + INITIAL_PREVIEW_SHAPE_SIDE, 
                        this.props.displayToNativeRatioX, this.props.displayToNativeRatioY,
                        previewShapeStartDimensions, this.props.width, this.props.height, dragLocation)

                    const previewShapesUpdates = {
                        width: deltas.dw,
                        height: deltas.dh
                    }

                    this.setState({
                        previewShapeDimensions: R.merge(this.state.previewShapeDimensions, previewShapesUpdates)
                    })
                }
            },
            onPanResponderTerminationRequest: () => true,
            onPanResponderRelease: (evt, gestureState) => {
                const { shapeIndex, touchState, isDrawing, shapeToRemoveIndex } = this.state

                // Remove a shape if the user has dragged it off screen
                if (shapeToRemoveIndex >= 0 && touchState.perimeterOnly) { 
                    this.deleteShapeWithKey(shapeToRemoveIndex)
                }
                // If the user is editing a shape, update the shape changes 
                else if (shapeIndex >= 0) {
                    const { dx, dy } = gestureState;
                    const dragLocation = {
                        x: this.state.dragOrigin.x + dx,
                        y: this.state.dragOrigin.y + dy
                    }

                    const shape = this.props.shapes[shapeIndex]
                    const deltas = calculateShapeChanges(touchState, dx, dy, 
                        this.props.displayToNativeRatioX, this.props.displayToNativeRatioY,
                        shape, this.props.width, this.props.height, dragLocation)

                    // Once the animation is complete, we report the final edit on the shape
                    this.props.onShapeEdited(shapeIndex, deltas)
                }
                // If the user isn't editing a shape, save the new drawnShape
                else if (isDrawing) {
                    this.props.onShapeCreated(this.state.previewShapeDimensions)
                }

                this.resetTouchState()
            },
            onShouldBlockNativeResponder: () => false
        });
    }

    deleteShapeWithKey(key) {
        if (key) {
            this.closeLocations = R.dissoc(key, this.closeLocations),
            this.cornerLocations = R.dissoc(key, this.cornerLocations),
            this.shapeLocations = R.dissoc(key, this.shapeLocations)
            this.props.onShapeDeleted(key)
        }
    }

    resetTouchState() {
        this.props.onShapeIsOutOfBoundsUpdates(false)
        this.setState({
            isDrawing: false,
            dragOrigin: { x: 0, y: 0},
            previewShapeDimensions: this.previewShapeInitialDimensions(),
            shapeIndex: -1,
            shapeToRemoveIndex: -1,
            touchState: {
                bottomLeft: false,
                bottomRight: false,
                upperLeft: false,
                upperRight: false,
                perimeterOnly: false
            }
        })
    }

    renderPreviewShape() {
        switch (this.props.drawingShape) {
            case 'rect':
                return (
                    <Rect 
                        stroke="black"
                        strokeWidth={4 * this.props.displayToNativeRatioX}
                        fill="rgba(0, 0, 0, .5)"
                        {... this.state.previewShapeDimensions}
                    />
                )
            default: 
                return null
        }
    }

    renderShapes() {        
        const shapeArray = []
        const convertObjectToComponent = (shape, index) => {
            const { type } = shape
            switch (type) {
                case ('rect'): {
                    const selectedShape = index !== this.state.shapeIndex
                    shapeArray.push(
                        <EditableRect
                            onRectLayout={(event) => {
                                this.shapeLocations = R.set(R.lensProp(index), event.nativeEvent.layout, this.shapeLocations)
                            }}
                            onCornerLayout={(event, corner) => {
                                this.cornerLocations = R.set(R.lensPath([index, corner]), event.nativeEvent.layout, this.cornerLocations)
                            }}
                            onCloseLayout={(event) => {
                                this.closeLocations = R.set(R.lensProp(index), event.nativeEvent.layout, this.closeLocations)
                            }}
                            key={index}
                            { ...shape }
                            blurred={this.state.shapeToRemoveIndex === index}
                            displayToNativeRatioX={this.props.displayToNativeRatioX}
                            displayToNativeRatioY={this.props.displayToNativeRatioY}
                            showCorners={this.props.mode === 'draw' && selectedShape}
                            isDeletable={this.props.mode === 'erase'}
                            ref={ref => {
                                if (ref) {
                                        this.shapeRefs = R.set(R.lensProp(index), ref, this.shapeRefs)
                                }
                            }}
                        />
                    )
                }
            }
        }
        
        R.mapObjIndexed(convertObjectToComponent, this.props.shapes)
        return shapeArray
    }

    render() {
        const panHandlers = this.props.mode === 'draw' ? this.editPanResponder.panHandlers : this.erasePanResponder.panHandlers
        return (
            <View { ...panHandlers } style={{height: this.props.height, width: this.props.width}}>
                <Svg
                    viewBox={this.props.viewBox}
                    height={this.props.height}
                    width={this.props.width}
                >
                    { this.renderShapes() }
                    { this.state.isDrawing && this.renderPreviewShape() }
                </Svg>
            </View>
        )
    }
}

ShapeEditorSvg.propTypes = {
    shapes: PropTypes.object,
    displayToNativeRatioX: PropTypes.number,
    displayToNativeRatioY: PropTypes.number,
    viewBox: PropTypes.string,
    height: PropTypes.number,
    width: PropTypes.number,
    mode: PropTypes.string,
    onShapeCreated: PropTypes.func,
    onShapeEdited: PropTypes.func,
    onShapeDeleted: PropTypes.func,
    drawingShape: PropTypes.string,
    onShapeIsOutOfBoundsUpdates: PropTypes.func,
    maxShapesDrawn: PropTypes.bool
}

export default ShapeEditorSvg