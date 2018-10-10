import React from 'react'
import {
    View,
    TouchableOpacity
} from 'react-native'
import PropTypes from 'prop-types'
import Icon from 'react-native-vector-icons/FontAwesome'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import EStyleSheet from 'react-native-extended-stylesheet'
import Theme from '../../../theme'

const RADIUS = 15
export const DrawingButton = ({ style, enabled, type, onPress }) => {
    const circleStyle = {
        width: RADIUS * 2,
        height: RADIUS * 2,
        borderRadius: RADIUS,
        backgroundColor: enabled ? Theme.$zooniverseTeal : 'transparent',
        borderWidth: 1,
        borderColor: Theme.$zooniverseTeal
    }

    const iconColor = enabled ? 'white' : 'black'

    return (
        <View style={style}>
            <View style={circleStyle}>
                <TouchableOpacity style={styles.buttonStyle} onPress={onPress} >
                    <View style={[styles.iconContainer, iconStyleFromType(type)]}>
                        <ButtonIcon type={type} size={RADIUS} color={iconColor} />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const ButtonIcon = ({type, ...props}) => {
    switch (type) {
        case 'edit':
            return <SimpleLineIcons name={'note'} {...props} />
        case 'draw':
            return <Icon name={'plus'} {...props} />
        case 'erase':
            return <SimpleLineIcons name={'trash'} {...props} />
    }
}

ButtonIcon.propTypes = {
    type: PropTypes.oneOf(['edit', 'draw', 'erase'])
}

const iconStyleFromType = (type) => {
    switch (type) {
        case 'edit':
            return { paddingLeft: 3 }
        default: 
            return {}
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
