import React from 'react'
import {
    TouchableOpacity
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import PropTypes from 'prop-types'
import EStyleSheet from 'react-native-extended-stylesheet'
import FontedText from '../common/FontedText'


const BetaFeedbackView = (props) => {
    return (
        <TouchableOpacity 
            style={styles.touchableContainer}
            onLayout={props.onLayout}
            onPress={props.onPress}
        >
            <FontedText style={styles.title}> Provide Beta Feedback For This Project </FontedText>
            <Icon style={styles.icon} name="arrow-right" />
        </TouchableOpacity>
    )
}

const styles = EStyleSheet.create({
    touchableContainer: {
        backgroundColor: '$zooniverseTeal',
        height: 36.5,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },
    title: {
        paddingRight: 10,
        color: 'white',
        fontWeight: 'bold'
    },
    icon: {
        color: 'white'
    }
})

BetaFeedbackView.propTypes = {
    onPress: PropTypes.func,
    onLayout: PropTypes.func,
}

export default BetaFeedbackView



