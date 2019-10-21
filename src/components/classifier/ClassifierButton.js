import React from 'react'
import {
    StyleSheet,
    TouchableOpacity
} from 'react-native'
import PropTypes from 'prop-types'
import EStyleSheet from 'react-native-extended-stylesheet'
import DeviceInfo from 'react-native-device-info'

import FontedText from '../common/FontedText'
import * as colorModes from '../../actions/colorModes'

const ClassifierButton = (props) => {
    const buttonStyle = [props.style, styles.button]
    const textStyle = []
    switch (props.type) {
        case 'answer':
            textStyle.push(styles.answerButtonText)
            if (props.disabled) {
                buttonStyle.push(colorModes.disabledButtonStyleFor(props.inMuseumMode))
            } else if (props.selected) {
                buttonStyle.push(colorModes.selectedButtonStyleFor(props.inMuseumMode))
            } else {
                buttonStyle.push(colorModes.unselectedButtonStyleFor(props.inMuseumMode))
            }
            break
        case 'guide':
            buttonStyle.push(styles.guideButton)
            break
    }
    return (
        <TouchableOpacity
            disabled={props.disabled}
            onPress={props.onPress}
            activeOpacity={0.5}
            style={ buttonStyle }
        >
            <FontedText style={[styles.buttonText, textStyle]}>
                { props.text }
            </FontedText>
        </TouchableOpacity>
    )
}


const styles =EStyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      },
      buttonText: {
        fontSize: DeviceInfo.isTablet() ? 22 : 14,
        marginVertical: 11,
        marginHorizontal: 9
      },
      guideButton: {
        borderWidth: StyleSheet.hairlineWidth,
        backgroundColor: 'white',
        borderColor: '$disabledIconColor',
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        shadowOpacity: 1,
        shadowRadius: 2,
        shadowOffset: {
            height: 1,
            width: 2,
        },
      },
      answerButtonText: {
        color: 'white',
      },
})

ClassifierButton.propTypes = {
    inMuseumMode: PropTypes.bool,
    selected: PropTypes.bool,
    blurred: PropTypes.bool,
    disabled: PropTypes.any,
    style: PropTypes.any,
    onPress: PropTypes.func,
    type: PropTypes.oneOf(['answer', 'guide']),
    text: PropTypes.string.isRequired
}

export default ClassifierButton
      