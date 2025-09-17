import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome'
import {
    TouchableOpacity,
    View
} from 'react-native'
import PropTypes from 'prop-types'

const CloseButton = (props) => {
    const backgroundViewSize = {
        height: props.size - 10,
        width: props.size - 10,
        borderRadius: props.size - 10,
        backgroundColor: props.backgroundColor
    }
    return (
        <TouchableOpacity
            onPress={props.onPress}
            style={[props.style, {height: props.size, width: props.size}]}
            activeOpacity={0.3}
        >
            <View
                style={[backgroundViewSize, styles.circle]}
            />
            <Icon
                style={styles.icon}
                name="times-circle"
                size={props.size}
                color={props.color}
            />
        </TouchableOpacity>
    )
}

const styles = {
    icon: {
        position: 'absolute',
        top: 0,
        left: 0
    },
    circle: {
        margin: 5
    }
}

CloseButton.propTypes = {
    backgroundColor: PropTypes.string,
    color: PropTypes.string,
    size: PropTypes.number,
    onPress: PropTypes.func,
    style: PropTypes.any
}

export default CloseButton