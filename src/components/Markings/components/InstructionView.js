import React from 'react'
import {
    TouchableOpacity,
    View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import PropTypes from 'prop-types'

import FontedText from '../../common/FontedText'
import Separator from '../../common/Separator'
import ShapeInstructionsView from './ShapeInstructionsView'

import * as colorModes from '../../../displayOptions/colorModes'

const InstructionView = (props) => {
    return (
        <View style={[styles.container, colorModes.contentBackgroundColorFor(props.inMuseumMode)]}>
            <ShapeInstructionsView {...props} />
            <Separator style={styles.separator} />
            <View style={styles.instructionsContainer} >
                <OptionButton
                    type="cancel"
                    onPress={props.onCancel}
                    inMuseumMode={props.inMuseumMode}
                />
                <OptionButton
                    type="save"
                    onPress={props.onSave}
                    inMuseumMode={props.inMuseumMode}
                />
            </View>
        </View>
    )
}

InstructionView.propTypes = {
    type: PropTypes.oneOf(['rectangle']),
    color: PropTypes.string,
    label: PropTypes.string,
    min: PropTypes.string,
    max: PropTypes.string,
    numberDrawn: PropTypes.number,
    onSave: PropTypes.func,
    onCancel: PropTypes.func,
    warnForRequirements: PropTypes.bool,
    inMuseumMode: PropTypes.bool,
}

/**
 * Component that displays the shape the user will draw
 * @param {type, color}  
 */
const ShapePreview = ({type, color}) => {
    switch (type) {
        case 'rectangle':
            return <View style={[styles.rectangleShape, {borderColor: color}]} />
        default:
            return <View />
    }
}
ShapePreview.propTypes = {
    type: PropTypes.oneOf(['rectangle']),
    color: PropTypes.string
}

/**
 * Component that is just a styled buttones
 */
const OptionButton =({type, onPress, inMuseumMode}) => {
    const buttonStyle = [styles.buttonStyle]
    const buttonTextStyle = [styles.buttonText, colorModes.textColorFor()]
    let buttonText = ''
    switch (type) {
        case 'cancel':
            buttonStyle.push(styles.cancelButton)
            buttonTextStyle.push(colorModes.helpTextColorFor(inMuseumMode))
            buttonText = 'Cancel'
            break
        case 'save':
            buttonStyle.push(styles.saveButton)
            buttonTextStyle.push(styles.saveButtonText)
            buttonText = 'Save & Close'
            break
    }
    return (
        <TouchableOpacity
            onPress={onPress}
            style={buttonStyle}
        >
            <FontedText style={buttonTextStyle}>{buttonText}</FontedText>
        </TouchableOpacity>
    )
}
OptionButton.propTypes = {
    type: PropTypes.oneOf(['cancel', 'save']),
    onPress: PropTypes.func,
    inMuseumMode: PropTypes.bool,
}

const styles = EStyleSheet.create({
    container: {
        backgroundColor: 'white'
    },
    instructionsContainer: {
        flexDirection: 'row',
        padding: 20
    },
    separator: {
        marginHorizontal: 20
    },
    buttonStyle: {
        alignItems: 'center'
    },
    buttonText: {
        fontSize: 14,
        marginVertical: 11
    },
    cancelButton: {
        flex: 1,
        borderWidth: 1,
        borderColor: '$zooniverseTeal',
        marginRight: 25
    },
    saveButton: {
        flex: 1,
        backgroundColor: '$zooniverseTeal'
    },
    saveButtonText: {
        color: 'white'
    },
})

export default InstructionView