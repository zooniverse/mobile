import React, { Component } from 'react'
import {
    TouchableOpacity
} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import FontedText from '../common/FontedText'
import PropTypes from 'prop-types'

import * as colorModes from '../../displayOptions/colorModes'

export class NeedHelpButton extends Component {

    render() {
        return (
            <TouchableOpacity onPress={this.props.onPress}>
                <FontedText style={[styles.needHelpText, colorModes.helpTextColorFor(this.props.inMuseumMode)]}>
                    NEED SOME HELP WITH THIS TASK?
                </FontedText>
            </TouchableOpacity>
        )
    }
}

NeedHelpButton.propTypes = {
    onPress: PropTypes.func,
    inMuseumMode: PropTypes.bool,
}

NeedHelpButton.defaultProps = {
    inMuseumMode: false,
}

const styles = {
    needHelpText: {
        fontSize: DeviceInfo.isTablet() ? 22 : 14,
        textAlign: 'center',
        marginTop: 15,
    }
}

export default NeedHelpButton
