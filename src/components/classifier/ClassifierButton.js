import React from 'react'
import {
    StyleSheet,
    TouchableOpacity
} from 'react-native'
import FontedText from '../common/FontedText'
import PropTypes from 'prop-types'
import EStyleSheet from 'react-native-extended-stylesheet'

const ClassifierButton = (props) => {
    const buttonStyle = [props.style, styles.button]
    const textStyle = []
    switch (props.type) {
        case 'answer':
            buttonStyle.push(styles.answerButton)
            textStyle.push(styles.answerButtonText)
            break
        case 'guide':
            buttonStyle.push(styles.guideButton)
            break
    }
    return (
        <TouchableOpacity
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
      answerButton: {
        backgroundColor: '$buttonColor'
      },
      answerButtonText: {
        color: 'white', 
      },
})

ClassifierButton.propTypes = {
    style: PropTypes.any,
    onPress: PropTypes.func,
    type: PropTypes.oneOf('answer', 'guide'),
    text: PropTypes.string.isRequired
}

export default ClassifierButton
      