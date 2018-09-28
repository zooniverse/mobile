import React from 'react'
import EStyleSheet from 'react-native-extended-stylesheet'
import {
    View, 
    ActivityIndicator
} from 'react-native'
import FontedText from './FontedText'
import Theme from '../../theme'

const SubjectLoadingIndicator = () => {
    
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={ Theme.$zooniverseTeal } />
            <FontedText style={styles.loadingText}> Loading Subject </FontedText>
        </View>
    )
}

const styles = EStyleSheet.create({
    loadingContainer: {
        flex:1, 
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center'
    },
    loadingText: {
        color: '$zooniverseTeal'
    }
})

export default SubjectLoadingIndicator