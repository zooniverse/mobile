import React, {Component} from 'react'
import { 
    G,
    Symbol,
    Path,
    Use,
    Rect
} from 'react-native-svg'
import PropTypes from 'prop-types'

/**
 * This class is the SVG definition for the FontAwesome Icon 'times-circle'
 * https://fontawesome.com/icons/times-circle?style=regular
 * 
 * We need to explicitly define it here because there are no ways to import fonts into react-native-svg
 */

class CloseButtonSVG extends Component {
    render() {
        const side = `${this.props.displayToNativeRatio * 30}`
        return (
            <G
            >
                <Symbol id="symbol" viewBox="0 0 512 512" >
                    <Path
                        fill={this.props.color}
                        d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm101.8-262.2L295.6 256l62.2 62.2c4.7 4.7 4.7 12.3 0 17l-22.6 22.6c-4.7 4.7-12.3 4.7-17 0L256 295.6l-62.2 62.2c-4.7 4.7-12.3 4.7-17 0l-22.6-22.6c-4.7-4.7-4.7-12.3 0-17l62.2-62.2-62.2-62.2c-4.7-4.7-4.7-12.3 0-17l22.6-22.6c4.7-4.7 12.3-4.7 17 0l62.2 62.2 62.2-62.2c4.7-4.7 12.3-4.7 17 0l22.6 22.6c4.7 4.7 4.7 12.3 0 17z"
                    />
                </Symbol>

                <Use
                    href="#symbol"
                    width={side} height={side}
                />
                <Rect onLayout={this.props.onLayout} width={side} height={side} fill="transparent" />
            </G>
        )
    }
}

CloseButtonSVG.propTypes = {
    displayToNativeRatio: PropTypes.number,
    color: PropTypes.string,
    onLayout: PropTypes.func,
}

export default CloseButtonSVG