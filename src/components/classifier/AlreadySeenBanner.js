import React from 'react'
import {
    View
} from 'react-native'
import FontedText from '../common/FontedText'
import EStyleSheet from 'react-native-extended-stylesheet'

const AlreadySeenBanner = () => {
    return (
        <View style={styles.alreadySeen}>
            <FontedText style={styles.alreadySeenText} >
                ALREADY SEEN!
            </FontedText>
        </View>
    )
}

const styles = EStyleSheet.create({
    alreadySeen: {
        elevation: 2,
        position: 'absolute',
        top: 16,
        right: 0,
        backgroundColor: '$darkOrange',
        paddingVertical: 2,
        paddingHorizontal: 5,
        transform: [{ rotate: '20deg'}]
    },
    alreadySeenText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold'
    },
})

export default AlreadySeenBanner