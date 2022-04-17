import React, {Component} from 'react';
import {
    StyleSheet,
    TouchableOpacity
} from 'react-native'
import PropTypes from 'prop-types'
import EStyleSheet from 'react-native-extended-stylesheet'
import DeviceInfo from 'react-native-device-info'

import SizedMarkdown from '../common/SizedMarkdown'
import * as colorModes from '../../displayOptions/colorModes'

class ClassifierButton extends Component {
    constructor(props) {
        super(props)
    }

    setAdditionalStyles() {
        this.buttonStyle = []
        this.textStyle = {}
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
                <SizedMarkdown
                    forButton={true}
                    style={this.textStyle}
                >
                    {this.props.text}
                </SizedMarkdown>
            </TouchableOpacity>
        )
    }
}

class AnswerButton extends ClassifierButton {
    setAdditionalStyles() {
        this.buttonStyle = []
        this.buttonStyle.push({padding: 10})
        this.textStyle = {
            ...styles.whiteButtonText
        }

        if (this.props.deselected) {
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
        this.textStyle = {
            ...colorModes.selectedTextColorFor(this.props.inMuseumMode)
        }

        this.buttonStyle.push(styles.guideButton)
        this.buttonStyle.push(colorModes.guideButtonStyleFor(this.props.inMuseumMode))
    }
}

class SubmitButton extends ClassifierButton {
    setAdditionalStyles() {
        this.buttonStyle = []
        this.textStyle = {
            ...colorModes.submitButtonTextColorFor(this.props.inMuseumMode)
        }

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
        this.textStyle = {
            ...styles.whiteButtonText
        }

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
        borderColor: '$zooniverseTeal',
    },
    whiteButtonText: {
        color: 'white',
    },
})

ClassifierButton.propTypes = {
    inMuseumMode: PropTypes.bool,
    selected: PropTypes.bool,
    deselected: PropTypes.bool, //Styling ONLY; does not affect whether users can interact with button
    blurred: PropTypes.bool,
    disabled: PropTypes.any,
    style: PropTypes.any,
    onPress: PropTypes.func,
    text: PropTypes.string.isRequired
}

export {ClassifierButton, AnswerButton, GuideButton, SubmitButton, SwipeButton}
      