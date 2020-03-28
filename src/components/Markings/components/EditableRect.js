import React, { Component } from 'react'
import {
    G,
    Rect,
    Circle,
} from 'react-native-svg'
import PropTypes from 'prop-types'
import Color from 'color';

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
    update({ dx, dy, dw, dh }) {
        const newWidth = this.props.width + dw < 0.1 ? this.props.width + dw + 1 : this.props.width + dw
        const newHeight = this.props.height + dh < 0.1 ? this.props.height + dh + 1 : this.props.height + dh
        const newX = this.props.x + dx < 0.1 ? this.props.x + dx + 1 : this.props.x + dx
        const newY = this.props.y + dy < 0.1 ? this.props.y + dy + 1 : this.props.y + dy

        const newDimensions = {
            x: `${newX}`,
            y: `${newY}`,
            width: `${newWidth}`,
            height: `${newHeight}`
        }

        if (this.rect) {
            this.rect.setNativeProps(newDimensions)
        }

        if (this.props.showCorners
            && this.upperLeftCircle
            && this.upperRightCircle
            && this.bottomRightCircle
            && this.bottomLeftCircle
        ) {
            this.upperLeftCircle.setNativeProps({
                cx: `${newX}`,
                cy: `${newY}`,
            })
            this.upperRightCircle.setNativeProps({
                cx: `${newX + newWidth}`,
                cy: `${newY}`
            })
            this.bottomRightCircle.setNativeProps({
                cx: `${newX + newWidth}`,
                cy: `${newY + newHeight}`
            })
            this.bottomLeftCircle.setNativeProps({
                cx: `${newX}`,
                cy: `${newY + newHeight}`
            })
        }

        return newDimensions
    }

    renderCloseButton() {
        const buttonRadius = 24;
        const {
            width, height, nativeWidth, x, y, displayToNativeRatioX, onCloseLayout, onDelete, color
        } = this.props

        const normalizedX = width > 0 ? x : x + width
        const shapeRightX = normalizedX + Math.abs(width)
        const newX = shapeRightX > nativeWidth - buttonRadius
            ? Math.max(normalizedX - buttonRadius, 0)
            : shapeRightX


        const normalizedY = height > 0 ? y : y + height
        const newY = newX === 0 || normalizedY < buttonRadius
            ? normalizedY
            : normalizedY - buttonRadius / 2

        return (
            <G x={newX} y={newY}>
                <CloseButtonSVG
                    displayToNativeRatio={displayToNativeRatioX}
                    onLayout={onCloseLayout}
                    color={color}
                    onPress={onDelete}
                />
            </G>
        )
    }

    render() {
        return (
            <G>
                <Rect
                    onLayout={this.props.onRectLayout}
                    ref={ref => this.rect = ref}
                    x={this.props.x}
                    y={this.props.y}
                    width={this.props.width}
                    height={this.props.height}
                    stroke={this.props.color}
                    strokeWidth={4 * this.props.displayToNativeRatioX}
                    fill={this.props.blurred ? Color(this.props.color).alpha(0.3).toString() : 'transparent'}
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
                                r={16 * this.props.displayToNativeRatioX}
                            />
                            <Circle
                                ref={ref => this.upperRightCircle = ref}
                                onLayout={(event) => this.props.onCornerLayout(event, RectCorners.upperRight)}
                                cx={this.props.x + this.props.width}
                                cy={this.props.y}
                                fill={this.props.color}
                                r={16 * this.props.displayToNativeRatioX}
                            />
                            <Circle
                                ref={ref => this.bottomLeftCircle = ref}
                                onLayout={(event) => this.props.onCornerLayout(event, RectCorners.bottomLeft)}
                                cx={this.props.x}
                                cy={this.props.height + this.props.y}
                                fill={this.props.color}
                                r={16 * this.props.displayToNativeRatioX}
                            />
                            <Circle
                                ref={ref => this.bottomRightCircle = ref}
                                onLayout={(event) => this.props.onCornerLayout(event, RectCorners.bottomRight)}
                                cx={this.props.width + this.props.x}
                                cy={this.props.height + this.props.y}
                                fill={this.props.color}
                                r={16 * this.props.displayToNativeRatioX}
                            />
                        </G> : null
                }

                {
                    this.props.isDeletable && this.renderCloseButton(this.props)
                }
            </G>
        )
    }
}

EditableRect.propTypes = {
    blurred: PropTypes.bool,
    displayToNativeRatioX: PropTypes.number,
    displayToNativeRatioY: PropTypes.number,
    x: PropTypes.number,
    y: PropTypes.number,
    nativeWidth: PropTypes.number.isRequired,
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