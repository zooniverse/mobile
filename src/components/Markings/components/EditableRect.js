import React, { Component } from 'react'
import {
    G,
    Rect,
    Circle,
} from 'react-native-svg'
import PropTypes from 'prop-types'
import CloseButtonSVG from './CloseButtonSVG'

export const RectCorners = {
    upperLeft: 'upperLeft',
    upperRight: 'upperRight',
    bottomLeft: 'bottomLeft',
    bottomRight: 'bottomRight'
}

class EditableRect extends Component {

    /**
     * Because Svgs don't plug in to react-native's animation engine,
     * we have to update their props natively.
     * 
     * This function handles updating the props of the svgs of this component by
     * taking an object of deltas
     * 
     * @param {An object that contains deltas to be applied to the shape} deltas
     */
    update({dx, dy, dw, dh}) {
        this.rect.setNativeProps({
            x: `${this.props.x + dx}`,
            y: `${this.props.y + dy}`,
            width: `${this.props.width + dw}`,
            height: `${this.props.height + dh}`
        })

        if (this.props.showCorners) {
            this.upperLeftCircle.setNativeProps({
                cx: `${this.props.x + dx}`,
                cy: `${this.props.y + dy}`,
            })
            this.upperRightCircle.setNativeProps({
                cx: `${this.props.x + dx + this.props.width + dw}`,
                cy: `${this.props.y + dy}`
            })
            this.bottomRightCircle.setNativeProps({
                cx: `${this.props.x + dx + this.props.width + dw}`,
                cy: `${this.props.y + dy + this.props.height + dh}`
            })
            this.bottomLeftCircle.setNativeProps({
                cx: `${this.props.x + dx}`,
                cy: `${this.props.y + dy + this.props.height + dh}`
            })
        }
    }

    render() {
        return (
            <G
                onLayout={this.props.onRectLayout}
            >
                <Rect
                    ref={ref => this.rect = ref}
                    x={this.props.x}
                    y={this.props.y}
                    width={this.props.width}
                    height={this.props.height}
                    stroke={this.props.color}
                    strokeWidth="4"
                    fill="transparent"
                />
                {
                    this.props.showCorners ? 
                        <G>
                            <Circle
                                ref={ref => this.upperLeftCircle = ref}
                                onLayout={(event) => this.props.onCornerLayout(event, RectCorners.upperLeft)}
                                cx={this.props.x}
                                cy={this.props.y}
                                fill={this.props.color}
                                r="8"
                            />
                            <Circle
                                ref={ref => this.upperRightCircle = ref}
                                onLayout={(event) => this.props.onCornerLayout(event, RectCorners.upperRight)}
                                cx={this.props.x + this.props.width}
                                cy={this.props.y}
                                fill={this.props.color}
                                r="8"
                            />
                            <Circle
                                ref={ref => this.bottomLeftCircle = ref}
                                onLayout={(event) => this.props.onCornerLayout(event, RectCorners.bottomLeft)}
                                cx={this.props.x}
                                cy={this.props.height + this.props.y}
                                fill={this.props.color}
                                r="8"
                            />
                            <Circle
                                ref={ref => this.bottomRightCircle = ref}
                                onLayout={(event) => this.props.onCornerLayout(event, RectCorners.bottomRight)}
                                cx={this.props.width + this.props.x}
                                cy={this.props.height + this.props.y}
                                fill={this.props.color}
                                r="8"
                            />
                        </G> : null
                }
                {
                    
                    this.props.isDeletable ?
                        <G
                            x={this.props.width > 0 ? this.props.width + this.props.x : this.props.x}
                            y={(this.props.height > 0 ? this.props.y : this.props.y - Math.abs(this.props.height)) - 15}
                        >
                            <CloseButtonSVG
                                onLayout={this.props.onCloseLayout}
                                color={this.props.color}
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

EditableRect.propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    color: PropTypes.string,
    showCorners: PropTypes.bool,
    isDeletable: PropTypes.bool,
    isDragging: PropTypes.bool,
    onRectLayout: PropTypes.func,
    onCornerLayout: PropTypes.func,
    onCloseLayout: PropTypes.func,
    onDelete: PropTypes.func
}

export default EditableRect