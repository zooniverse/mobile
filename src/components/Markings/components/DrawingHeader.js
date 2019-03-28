import React from 'react'
import {
    View
} from 'react-native'
import PropTypes from 'prop-types'

const DrawingHeader = (props) => {
    return props.horizontal ? 
        <View style={styles.horizontalContainer}>
            <View style={styles.horizontalQuestionContainer}>
                {props.question}
            </View>
            <View style={styles.horizontalInstructionContainer}>
                {props.instructions}
            </View>
        </View>
    :
        <View>
            <View style={styles.verticalQuestionContainer}>
                {props.question}
            </View>
            {props.instructions}
        </View>
}

const styles = {
    horizontalContainer: {
        flexDirection: 'row'
    },
    horizontalQuestionContainer: {
        maginRight: 15,
        flex: 2
    },
    horizontalInstructionContainer: {
        flex: 1
    },
    verticalQuestionContainer: {
        marginBottom: 10
    }
}

DrawingHeader.propTypes = {
    horizontal: PropTypes.bool,
    question: PropTypes.object.isRequired,
    instructions: PropTypes.object.isRequired
}

DrawingHeader.defaultProps = {
    horizontal: false
}

export default DrawingHeader
