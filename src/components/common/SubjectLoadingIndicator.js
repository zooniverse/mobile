import React from 'react'
import EStyleSheet from 'react-native-extended-stylesheet'
import {
    View, 
    ActivityIndicator
} from 'react-native'
import PropTypes from 'prop-types'

import FontedText from './FontedText'
import Theme from '../../theme'

const SubjectLoadingIndicator = (props) => {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={ Theme.$zooniverseTeal } />
            <FontedText style={styles.loadingText}> {`Loading Subject${props.multipleSubjects ? 's' : ''}`} </FontedText>
        </View>
    )
}

SubjectLoadingIndicator.propTypes = {
    multipleSubjects: PropTypes.bool
}

const styles = EStyleSheet.create({
    loadingContainer: {
        flex:1, 
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center'
    },
    loadingText: {
        color: '$zooniverseTeal'
    }
})

export default SubjectLoadingIndicator