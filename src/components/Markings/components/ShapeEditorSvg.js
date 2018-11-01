import React, { Component } from 'react'
import {
    PanResponder,
    View
} from 'react-native'
import { 
    Svg,
} from 'react-native-svg'
import R from 'ramda'
import PropTypes from 'prop-types'
import EditableRect from './EditableRect'
import {
    analyzeCoordinateWithShape,
    calculateShapeChanges,
    isCoordinateWithinSquare
} from '../../../utils/shapeUtils'

/**
 * This class handles all user interactions with shapes that are already drawn.
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

class ShapeEditorSvg extends Component {

    constructor(props) {
        super(props)

        this.state = {
            shapeLocations: {},
            cornerLocations: {},
            closeLocations: {},
            shapeIndex: -1,
            touchState: {
                bottomLeft: false,
                bottomRight: false,
                upperLeft: false,
                upperRight: false,
                onlySquare: false
            },
            shapeRefs: {}
        }

        this.erasePanResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => this.props.mode === 'erase',
            onStartShouldSetPanResponderCapture: () => this.props.mode === 'erase',
            onMoveShouldSetPanResponder: () => this.props.mode === 'erase',
            onMoveShouldSetPanResponderCapture: () => this.props.mode === 'erase',
            onPanResponderGrant: (evt) => {
                const { locationX, locationY } = evt.nativeEvent
                let keyToDelete = undefined
                R.forEachObjIndexed((closeShape, key) => {
                    if (isCoordinateWithinSquare(locationX, locationY, closeShape)) {
                        keyToDelete = key
                    }
                }, this.state.closeLocations)
                if (keyToDelete) {
                    this.setState({
                        closeLocations: R.dissoc(keyToDelete, this.state.closeLocations),
                        cornerLocations: R.dissoc(keyToDelete, this.state.cornerLocations),
                        shapeLocations: R.dissoc(keyToDelete, this.state.shapeLocations)
                    })
                    this.props.onShapeDeleted(keyToDelete)
                }
            }
        })

        this.editPanResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => this.props.mode === 'edit',
            onStartShouldSetPanResponderCapture: () => this.props.mode === 'edit',
            onMoveShouldSetPanResponder: () => this.props.mode === 'edit',
            onMoveShouldSetPanResponderCapture: () => this.props.mode === 'edit',
            onPanResponderGrant: (evt) => {
                const { locationX, locationY } = evt.nativeEvent

                // Determine if the user is touching a shape and where in the shape they are touching
                const analyzedLocations = R.mapObjIndexed((shape, key) => {
                    return analyzeCoordinateWithShape(locationX, locationY, shape, this.state.cornerLocations[key])
                }, this.state.shapeLocations)
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
            },
            onPanResponderMove: (evt, gestureState) => {
                const { shapeIndex, touchState, shapeRefs } = this.state
                if (shapeIndex >= 0) {
                    const { dx, dy } = gestureState;

                    // Because Svgs don't have any way to animate, we have to update their props manually
                    const deltas = calculateShapeChanges(touchState, dx, dy, this.props.displayToNativeRatioX, this.props.displayToNativeRatioY)
                    shapeRefs[shapeIndex].update(deltas);
                }
            },
            onPanResponderTerminationRequest: () => true,
            onPanResponderRelease: (evt, gestureState) => {
                const { shapeIndex, touchState } = this.state
                if (shapeIndex >= 0) {
                    const { dx, dy } = gestureState;
                    const deltas = calculateShapeChanges(touchState, dx, dy, this.props.displayToNativeRatioX, this.props.displayToNativeRatioY)

                    // Once the animation is complete, we report the final edit on the shape
                    this.props.onShapeEdited(shapeIndex, touchState, deltas)
                    this.resetTouchState()
                }
            },
            onShouldBlockNativeResponder: () => false
        });
    }

    resetTouchState() {
        this.setState({
            shapeIndex: -1,
            touchState: {
                bottomLeft: false,
                bottomRight: false,
                upperLeft: false,
                upperRight: false,
                onlySquare: false
            }
        })
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
                                this.setState({
                                    shapeLocations: R.set(R.lensProp(index), event.nativeEvent.layout, this.state.shapeLocations)
                                })
                            }}
                            onCornerLayout={(event, corner) => {
                                this.setState({
                                    cornerLocations: R.set(R.lensPath([index, corner]), event.nativeEvent.layout, this.state.cornerLocations)
                                })
                            }}
                            onCloseLayout={(event) => {
                                this.setState({
                                    closeLocations: R.set(R.lensProp(index), event.nativeEvent.layout, this.state.closeLocations)
                                })
                            }}
                            key={index}
                            { ...shape }
                            displayToNativeRatioX={this.props.displayToNativeRatioX}
                            displayToNativeRatioY={this.props.displayToNativeRatioY}
                            showCorners={this.props.mode === 'edit' && selectedShape}
                            isDeletable={this.props.mode === 'erase'}
                            ref={ref => this.setState({
                                shapeRefs: R.set(R.lensProp(index), ref ,this.state.shapeRefs)
                            })}
                        />
                    )
                }
            }
        }
        
        R.mapObjIndexed(convertObjectToComponent, this.props.shapes)
        return shapeArray
    }

    shouldComponentUpdate(nextProps, nextState) {
        const updateChanges = (val, key) => key !== 'cornerLocations' && key !== 'shapeLocations'
        const filteredNextState = R.pickBy(updateChanges, nextState)
        const filteredState = R.pickBy(updateChanges, this.state)

        if (R.equals(filteredNextState, filteredState) && R.equals(nextProps, this.props)) {
            return false
        }

        return true
    }

    render() {
        const panHandlers = this.props.mode === 'edit' ? this.editPanResponder.panHandlers : this.erasePanResponder.panHandlers
        return (
            <View { ...panHandlers } style={{height: this.props.height, width: this.props.width}}>
                <Svg
                    viewBox={this.props.viewBox}
                    height={this.props.height}
                    width={this.props.width}
                >
                    { this.renderShapes() }
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
    onShapeEdited: PropTypes.func,
    onShapeDeleted: PropTypes.func,
}

export default ShapeEditorSvg