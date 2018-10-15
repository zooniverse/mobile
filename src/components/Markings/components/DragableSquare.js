import React from 'react'
import {
    PanResponder,
} from 'react-native'
import PropTypes from 'prop-types'
import { 
    G,
    Circle,
    Rect
} from 'react-native-svg'
import CloseButtonSVG from './CloseButtonSVG'
import {
    distanceFromRange,
    distanceFromRangeToRange
} from '../../../utils/drawingUtils'

class DragableSquare extends React.Component {

    createPanResponder = (onPanResponderMove, onPanResponderRelease) => PanResponder.create({
        // Ask to be the responder:
        onStartShouldSetPanResponder: () => this.props.isEditable,
        onStartShouldSetPanResponderCapture: () => this.props.isEditable,
        onMoveShouldSetPanResponder: () => this.props.isEditable,
        onMoveShouldSetPanResponderCapture: () => this.props.isEditable,
        onPanResponderTerminationRequest: () => this.props.isEditable,
        onShouldBlockNativeResponder: () => this.props.isEditable,
        onPanResponderMove,
        onPanResponderRelease,
    });

    constructor(props) {
        super(props)

        /**
         * Even though we receive props for positioning,
         * we use state to animate pan gestures. We do this 
         * so we don't update global state on pan gestures
         */
        this.state = { 
            x: props.x,
            y: props.y,
            width: props.width,
            height: props.height
        }
        
        /**
         * When this component is dragable, each corner of the square gets a circle.
         * Each Circle receives a pan responder that mutates the square,
         */
        this.topLeftResponder = this.createPanResponder(
            (evt, gestureState) => {
                const { dx, dy } = gestureState;
                const { locationY } = evt.nativeEvent
                this.setState({
                    x: this.props.x + dx,
                    y: this.props.y + dy - distanceFromRange(locationY, 0, this.props.containerHeight),
                    width: this.props.width - dx,
                    height: this.props.height - (dy - distanceFromRange(locationY, 0, this.props.containerHeight))
                })
            },
            (evt, gestureState) => {
                const { dx, dy } = gestureState;
                const { locationY } = evt.nativeEvent
                this.props.onShapeModified({
                    dx, 
                    dy: dy - distanceFromRange(locationY, 0,this.props.containerHeight), 
                    dw: -dx,
                    dh: -(dy - distanceFromRange(locationY, 0,this.props.containerHeight))
                }, this.props.index)
            }
        )

        this.topRightResponder = this.createPanResponder(
            (evt, gestureState) => {
                const { dx, dy } = gestureState;
                const { locationY } = evt.nativeEvent
                this.setState({
                    y: this.props.y + dy - distanceFromRange(locationY, 0,this.props.containerHeight),
                    width: this.props.width + dx,
                    height: this.props.height - (dy - distanceFromRange(locationY, 0,this.props.containerHeight))
                })
            },
            (evt, gestureState) => {
                const { dx, dy } = gestureState;
                const { locationY } = evt.nativeEvent
                this.props.onShapeModified({
                    dy: dy - distanceFromRange(locationY, 0,this.props.containerHeight), 
                    dw: dx,
                    dh: - (dy - distanceFromRange(locationY, 0,this.props.containerHeight))
                }, this.props.index)
            },
        )

        this.bottomLeftResponder = this.createPanResponder(
            (evt, gestureState) => {
                const { dx, dy } = gestureState;
                const { locationY } = evt.nativeEvent
                this.setState({
                    x: this.props.x + dx,
                    width: this.props.width - dx,
                    height: this.props.height + dy - distanceFromRange(locationY, 0,this.props.containerHeight)
                })
            },
            (evt, gestureState) => {
                const { dx, dy } = gestureState;
                const { locationY } = evt.nativeEvent
                this.props.onShapeModified({
                    dx, 
                    dw: -dx, 
                    dh: dy - distanceFromRange(locationY, 0,this.props.containerHeight),
                }, this.props.index)
            },
        )

        this.bottomRightResponder = this.createPanResponder(
            (evt, gestureState) => {
                const { dx, dy } = gestureState;
                const { locationY } = evt.nativeEvent
                this.setState({
                    width: this.props.width + dx,
                    height: this.props.height + dy - distanceFromRange(locationY, 0,this.props.containerHeight)
                })
            },
            (evt, gestureState) => {
                const { dx, dy } = gestureState;
                const { locationY } = evt.nativeEvent
                this.props.onShapeModified({ 
                    dw: dx,
                    dh: dy - distanceFromRange(locationY, 0,this.props.containerHeight)
                }, this.props.index)
            },
        )

        /**
         * In addition, the square itself is dragable to change it's position.
         */

        this.squareDragResponder = this.createPanResponder(
            (evt, gestureState) => {
                const { dx, dy } = gestureState;
                const xSide = this.props.x + dx
                const widthSide = xSide + this.state.width
                const ySide = this.props.y + dy
                const heightSide = ySide + this.state.height
                this.setState({
                    x: xSide - distanceFromRangeToRange(Math.min(xSide, widthSide), Math.max(xSide,widthSide), 0, this.props.containerWidth),
                    y: ySide - distanceFromRangeToRange(Math.min(ySide, heightSide), Math.max(ySide,heightSide), 0, this.props.containerHeight)
                })
            },
            (evt, gestureState) => {
                const { dx, dy } = gestureState;
                const xSide = this.props.x + dx
                const widthSide = xSide + this.state.width
                const ySide = this.props.y + dy
                const heightSide = ySide + this.state.height
                this.props.onShapeModified({
                    dx: dx - distanceFromRangeToRange(Math.min(xSide, widthSide), Math.max(xSide,widthSide), 0, this.props.containerWidth),
                    dy: dy - distanceFromRangeToRange(Math.min(ySide, heightSide), Math.max(ySide,heightSide), 0, this.props.containerHeight)
                }, this.props.index)
            },
        )
    }

    render() { 
        return (
            <G>
                <Rect
                    {...this.squareDragResponder.panHandlers}
                    ref={ ref => this.rect = ref }
                    x={this.state.x}
                    y={this.state.y}
                    width={this.state.width}
                    height={this.state.height}
                    stroke={this.props.color}
                    strokeWidth="4"
                    fill="transparent"
                />
                <Circle
                    {...this.topLeftResponder.panHandlers }
                    ref={ ref => this.topLeftButton = ref }
                    x={this.state.x}
                    y={this.state.y}
                    fill={this.props.isEditable ? this.props.color : 'transparent'}
                    r="8"
                />
                <Circle
                    {...this.topRightResponder.panHandlers }
                    ref={ ref => this.topRightButton = ref }
                    x={this.state.x + this.state.width}
                    y={this.state.y}
                    fill={this.props.isEditable ? this.props.color : 'transparent'}
                    r="8"
                />
                <Circle
                    {...this.bottomLeftResponder.panHandlers}
                    ref={ ref => this.bottomLeftButton = ref }
                    x={this.state.x}
                    y={this.state.height + this.state.y}
                    fill={this.props.isEditable ? this.props.color : 'transparent'}
                    r="8"
                />
                <Circle
                    {...this.bottomRightResponder.panHandlers}
                    ref={ ref => this.bottomRightButton = ref }
                    x={this.state.width + this.state.x}
                    y={this.state.height + this.state.y}
                    fill={this.props.isEditable ? this.props.color : 'transparent'}
                    r="8"
                />
                {
                    
                    this.props.isDeletable ?
                        <G
                            x={this.state.width > 0 ? this.state.width + this.state.x : this.state.x}
                            y={(this.state.height > 0 ? this.state.y : this.state.y - Math.abs(this.state.height)) - 15}
                        >
                            <CloseButtonSVG
                                onPress={this.props.onDelete}
                            />
                        </G>
                    :
                        null
                }
            </G>
        )
    }
}

DragableSquare.propTypes = {
    index: PropTypes.string.isRequired,
    y: PropTypes.number,
    x: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    color: PropTypes.string,
    isEditable: PropTypes.bool,
    isDeletable: PropTypes.bool,
    onDelete: PropTypes.func,
    onShapeModified: PropTypes.func,
    containerHeight: PropTypes.number,
    containerWidth: PropTypes.number
}

export default DragableSquare