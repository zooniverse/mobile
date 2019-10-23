import React, {Component} from 'react';
import {
    StyleSheet,
    TouchableOpacity
} from 'react-native'
import PropTypes from 'prop-types'
import EStyleSheet from 'react-native-extended-stylesheet'
import DeviceInfo from 'react-native-device-info'

import FontedText from '../common/FontedText'
import * as colorModes from '../../actions/colorModes'

class ClassifierButton extends Component {
    constructor(props) {
        super(props)
    }

    setAdditionalStyles() {
        this.buttonStyle = []
        this.textStyle = []
    }

    render() {
        this.setAdditionalStyles();

        return (
            <TouchableOpacity
                disabled={this.props.disabled}
                onPress={this.props.onPress}
                activeOpacity={0.5}
                style={[this.props.style, styles.button, this.buttonStyle]}
            >
                <FontedText style={[styles.buttonText, this.textStyle]}>
                    {this.props.text}
                </FontedText>
            </TouchableOpacity>
        )
    }
}

class AnswerButton extends ClassifierButton {
    setAdditionalStyles() {
        this.buttonStyle = []
        this.textStyle = []
        this.textStyle.push(styles.whiteButtonText)

        if (this.props.disabled) {
            this.buttonStyle.push(colorModes.disabledButtonStyleFor(this.props.inMuseumMode))
        } else if (this.props.selected) {
            this.buttonStyle.push(colorModes.selectedButtonStyleFor(this.props.inMuseumMode))
        } else {
            this.buttonStyle.push(colorModes.unselectedButtonStyleFor(this.props.inMuseumMode))
        }
    }
}

class GuideButton extends ClassifierButton {
    setAdditionalStyles() {
        this.buttonStyle = []
        this.textStyle = []
        this.buttonStyle.push(styles.guideButton)
    }
}

class SubmitButton extends ClassifierButton {
    setAdditionalStyles() {
        this.buttonStyle = []
        this.textStyle = []
        this.textStyle.push(colorModes.submitButtonTextColorFor(this.props.inMuseumMode))

        if (this.props.disabled) {
            this.buttonStyle.push(colorModes.disabledSubmitButtonStyleFor(this.props.inMuseumMode))
        } else {
            this.buttonStyle.push(colorModes.submitButtonStyleFor(this.props.inMuseumMode))
        }
    }
}

class SwipeButton extends ClassifierButton {
    setAdditionalStyles() {
        this.buttonStyle = []
        this.textStyle = []
        this.textStyle.push(styles.whiteButtonText)
        this.buttonStyle.push(colorModes.unselectedButtonStyleFor(this.props.inMuseumMode))
    }
}

const styles = EStyleSheet.create({
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
    whiteButtonText: {
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
    text: PropTypes.string.isRequired
}

export {ClassifierButton, AnswerButton, GuideButton, SubmitButton, SwipeButton}
      