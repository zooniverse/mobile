import React from 'react'
import {
    View,
    TouchableOpacity
} from 'react-native'
import PropTypes from 'prop-types'
import Icon from 'react-native-vector-icons/FontAwesome'
import EStyleSheet from 'react-native-extended-stylesheet'

const radius = 20
export const DrawingButton = ({ style, enabled, type, onPress }) => {
    const circleStyle = {
        width: radius * 2,
        height: radius * 2,
        borderRadius: radius,
        backgroundColor: enabled ? 'white' : 'transparent',
        borderWidth: 1,
        borderColor: 'white'
    }

    const iconColor = enabled ? 'black' : 'white'
    const icon = iconFromType(type)
    const iconStyle = iconStyleFromType(type)

    return (
        <View style={style}>
            <View style={circleStyle}>
                <TouchableOpacity style={styles.buttonStyle} onPress={onPress} >
                    <View style={styles.iconContainer}>
                        <Icon style={iconStyle} name={icon} size={radius} color={iconColor} />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const iconFromType = (type) => {
    switch (type) {
        case 'edit':
            return 'mouse-pointer'
        case 'draw':
            return 'edit'
        case 'erase':
            return 'eraser'
    }
}

const iconStyleFromType = (type) => {
    switch (type) {
        case 'edit':
            return styles.iconPadding
        case 'draw':
            return styles.iconPadding
        case 'erase':
            return { }
    }
}

DrawingButton.propTypes = {
    enabled: PropTypes.bool,
    onPress: PropTypes.func,
    type: PropTypes.string,
    style: PropTypes.object
}

const styles = EStyleSheet.create({
    buttonStyle: {
        flex: 1
    },
    iconPadding: {
        paddingLeft: 5
    },
    iconContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
