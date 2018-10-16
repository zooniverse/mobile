import React from 'react'
import {
    View,
    TouchableOpacity
} from 'react-native'
import PropTypes from 'prop-types'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import EStyleSheet from 'react-native-extended-stylesheet'
import Theme from '../../../theme'

const RADIUS = 15
export const DrawingButton = ({ style, activated, type, onPress, disabled }) => {
    const circleStyle = {
        width: RADIUS * 2,
        height: RADIUS * 2,
        borderRadius: RADIUS,
        backgroundColor: activated ? Theme.$zooniverseTeal : 'transparent',
        borderWidth: 1,
        borderColor: Theme.$zooniverseTeal
    }

    const iconColor = activated ? 'white' : 'rgba(92, 92, 92, 1)'
    const opacity = {opacity: disabled ? 0.5 : 1}

    return (
        <View style={style}>
            <View style={[circleStyle, opacity]}>
                <TouchableOpacity style={styles.buttonStyle} onPress={onPress} disabled={disabled}>
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
            return <FontAwesome5 name={'edit'} {...props} solid/>
        case 'draw':
            return <FontAwesome5 name={'plus'} {...props} />
        case 'erase':
            return <FontAwesome5 name={'trash'} {...props} />
        case 'undo':
            return <FontAwesome5 name={'undo'} {...props} />
    }
}

ButtonIcon.propTypes = {
    type: PropTypes.oneOf(['edit', 'draw', 'erase', 'undo'])
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
    activated: PropTypes.bool,
    disabled: PropTypes.bool,
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
