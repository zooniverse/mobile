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
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as drawingScreenAction from '../../../actions/drawingScreen'

const mapStateToProps = (state, ownProps) => {
    const { x, y, width, height, color } = state.drawingScreen.shapes[ownProps.index]
    return {
        x,
        y,
        width,
        height,
        color
    }
}

const mapDispatchToProps = (dispatch) => ({
    drawingScreenActions: bindActionCreators(drawingScreenAction, dispatch)
})


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
                this.setState({
                    x: this.props.x + dx,
                    y: this.props.y + dy,
                    width: this.props.width - dx,
                    height: this.props.height - dy
                })
            },
            (evt, gestureState) => {
                const { dx, dy } = gestureState;
                this.props.drawingScreenActions.mutateShapeAtIndex({
                    dx, 
                    dy, 
                    dw: -dx,
                    dh: -dy
                }, this.props.index)
            }
        )

        this.topRightResponder = this.createPanResponder(
            (evt, gestureState) => {
                const { dx, dy } = gestureState;
                this.setState({
                    y: this.props.y + dy,
                    width: this.props.width + dx,
                    height: this.props.height - dy
                })
            },
            (evt, gestureState) => {
                const { dx, dy } = gestureState;
                this.props.drawingScreenActions.mutateShapeAtIndex({
                    dy, 
                    dw: dx,
                    dh: -dy
                }, this.props.index)
            },
        )

        this.bottomLeftResponder = this.createPanResponder(
            (evt, gestureState) => {
                const { dx, dy } = gestureState;
                this.setState({
                    x: this.props.x + dx,
                    width: this.props.width - dx,
                    height: this.props.height + dy
                })
            },
            (evt, gestureState) => {
                const { dx, dy } = gestureState;
                this.props.drawingScreenActions.mutateShapeAtIndex({
                    dx, 
                    dw: -dx, 
                    dh: dy,
                }, this.props.index)
            },
        )

        this.bottomRightResponder = this.createPanResponder(
            (evt, gestureState) => {
                const { dx, dy } = gestureState;
                this.setState({
                    width: this.props.width + dx,
                    height: this.props.height + dy
                })
            },
            (evt, gestureState) => {
                const { dx, dy } = gestureState;
                this.props.drawingScreenActions.mutateShapeAtIndex({ 
                    dw: dx,
                    dh: dy
                }, this.props.index)
            },
        )

        /**
         * In addition, the square itself is dragable to change it's position.
         */

        this.squareDragResponder = this.createPanResponder(
            (evt, gestureState) => {
                const { dx, dy } = gestureState;
                this.setState({
                    x: this.props.x + dx,
                    y: this.props.y + dy
                })
            },
            (evt, gestureState) => {
                const { dx, dy } = gestureState;
                this.props.drawingScreenActions.mutateShapeAtIndex({
                    dx, 
                    dy, 
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
    drawingScreenActions: PropTypes.object
}

export default connect(mapStateToProps, mapDispatchToProps)(DragableSquare)