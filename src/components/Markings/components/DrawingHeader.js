import React from 'react'
import {
    View
} from 'react-native'
import PropTypes from 'prop-types'

const DrawingHeader = (props) => {
    return props.horizontal ? 
        <View style={styles.horizontalContainer}>
            <View style={styles.horizontalQuestionContainer}>
                {props.renderQuestion()}
            </View>
            <View style={styles.horizontalInstructionContainer}>
                {props.renderInstructions()}
            </View>
        </View>
    :
        <View>
            <View style={styles.verticalQuestionContainer}>
                {props.renderQuestion()}
            </View>
            {props.renderInstructions()}
        </View>
}

const styles = {
    horizontalContainer: {
        flexDirection: 'row'
    },
    horizontalQuestionContainer: {
        flex: 5
    },
    horizontalInstructionContainer: {
        flex: 4
    },
    verticalQuestionContainer: {
        marginBottom: 10
    }
}

DrawingHeader.propTypes = {
    horizontal: PropTypes.bool,
    renderQuestion: PropTypes.func.isRequired,
    renderInstructions: PropTypes.func.isRequired
}

DrawingHeader.defaultProps = {
    horizontal: false
}

export default DrawingHeader
