import React from 'react'
import {
    TouchableOpacity,
    View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

import PropTypes from 'prop-types'
import FontedText from '../../common/FontedText'
import Separator from '../../common/Separator'

const SUPPORTED_SHAPES = ['rectangle']

const infoText = (min, max, numberDrawn) => {
    return `${numberDrawn} of ${min} required, ${max} maximum`
}

const InstructionView = (props) => {
    return (
        <View style={styles.container}>
            <View style={styles.instructionsContainer} >
                <ShapePreview type={props.type} color={props.color} />
                <View style={styles.textContainer} >
                    <FontedText style={styles.label}>
                        {props.label}
                    </FontedText>
                    <FontedText style={styles.infoText}> 
                        {infoText(props.min, props.max, props.numberDrawn)}
                    </FontedText>
                </View>
            </View>
            <Separator style={styles.separator} />
            <View style={styles.instructionsContainer} >
                <OptionButton type="cancel" onPress={props.onCancel} />
                <OptionButton type="save" onPress={props.onSave} />
            </View>
        </View>
    )
}

InstructionView.propTypes = {
    type: PropTypes.oneOf(SUPPORTED_SHAPES),
    color: PropTypes.string,
    label: PropTypes.string,
    min: PropTypes.string,
    max: PropTypes.string,
    numberDrawn: PropTypes.number,
    onSave: PropTypes.func,
    onCancel: PropTypes.func
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
    type: PropTypes.oneOf(SUPPORTED_SHAPES),
    color: PropTypes.string
}

/**
 * Component that is just a styled buttones
 */
const OptionButton =({type, onPress}) => {
    const buttonStyle = [styles.buttonStyle]
    const buttonTextStyle = [styles.buttonText]
    let buttonText = ''
    switch (type) {
        case 'cancel':
            buttonStyle.push(styles.cancelButton)
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
    onPress: PropTypes.func
}

const styles = EStyleSheet.create({
    container: {
        backgroundColor: 'white'
    },
    instructionsContainer: {
        flexDirection: 'row',
        padding: 20
    },
    textContainer: {
        flexDirection: 'column',
        flex: 1,
        paddingLeft: 15
    },
    label: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    infoText: {
        fontSize: 14,
        color: '$headerGrey'
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
    rectangleShape: {
        width: 30,
        height: 30,
        borderWidth: 2
    }
})

export default InstructionView