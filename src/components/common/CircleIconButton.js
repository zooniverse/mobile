import React from 'react'
import {
    View,
    TouchableOpacity
} from 'react-native'
import PropTypes from 'prop-types'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import EStyleSheet from 'react-native-extended-stylesheet'
import DeviceInfo from 'react-native-device-info';

import * as colorModes from '../../displayOptions/colorModes'

const CircleIconButton = ({ style, activated, type, onPress, disabled, radius, inMuseumMode }) => {
    const circleStyle = {
        width: radius * 2,
        height: radius * 2,
        borderRadius: radius,
        backgroundColor: activated ?
            colorModes.activeIconBackgroundColorFor(inMuseumMode)
            : 'transparent',
        borderWidth: DeviceInfo.isTablet() ? 2 : 1,
        borderColor: colorModes.activeIconBackgroundColorFor(inMuseumMode),
    }

    const iconColor = activated ?
        colorModes.activeIconForegroundColorFor(inMuseumMode)
        : colorModes.inactiveIconForegroundColorFor(inMuseumMode)
    const opacity = {opacity: disabled ? 0.5 : 1}

    return (
        <View style={style}>
            <View style={[circleStyle, opacity]}>
                <TouchableOpacity style={styles.buttonStyle} onPress={onPress} disabled={disabled}>
                    <View style={[styles.iconContainer, iconStyleFromType(type)]}>
                        <ButtonIcon type={type} size={radius} color={iconColor} />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const ButtonIcon = ({type, ...props}) => {
    switch (type) {
        case 'share': 
            return <SimpleLineIcons name={'share-alt'} {...props} />
        case 'expand':
            return <SimpleLineIcons name={'size-fullscreen'} {...props} />
        case 'edit':
            return <FontAwesome5 name={'edit'} {...props} solid />
        case 'draw':
            return <FontAwesome5 name={'plus'} {...props} />
        case 'erase':
            return <FontAwesome5 name={'trash'} {...props} />
        case 'undo':
            return <FontAwesome5 name={'undo'} {...props} />
    }
}

ButtonIcon.propTypes = {
    type: PropTypes.oneOf(['edit', 'draw', 'erase', 'undo', 'expand', 'share'])
}

const iconStyleFromType = (type) => {
    switch (type) {
        case 'edit':
            return { paddingLeft: 3 }
        default: 
            return {}
    }
}

CircleIconButton.propTypes = {
    radius: PropTypes.number,
    activated: PropTypes.bool,
    disabled: PropTypes.bool,
    onPress: PropTypes.func,
    type: PropTypes.string,
    style: PropTypes.object,
    inMuseumMode: PropTypes.bool,
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

export default CircleIconButton