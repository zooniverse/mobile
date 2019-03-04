import React from 'react'
import {
  Switch,
  View
} from 'react-native'
import PropTypes from 'prop-types';
import FontedText from '../common/FontedText'
import EStyleSheet from 'react-native-extended-stylesheet'
import theme from '../../theme'

export const SettingHeader = ({text}) => {
    return (
        <FontedText style={styles.settingHeader}>
            {text}
        </FontedText>
    )
}
  
export const SettingsToggle = ({onToggle, title, description, value, disabled, style}) => {
    return (
        <View style={style}>
            <View style={styles.settingsToggleContainer}>
                <Switch
                    disabled={disabled}
                    trackColor={theme.$zooniverseTeal}
                    onValueChange={onToggle}
                    value={value}
                />
                <View style={styles.toggleTextContainer}>
                    <FontedText style={styles.toggleTitle}>
                        {title}
                    </FontedText>
                    {description ? 
                        <FontedText>
                            {description}
                        </FontedText>
                    : null }
                </View>
            </View>
        </View>
    )
}

SettingHeader.propTypes = {
    text: PropTypes.string
}

SettingsToggle.propTypes = {
    title: PropTypes.string,
    description: PropTypes.string,
    onToggle: PropTypes.func,
    style: PropTypes.any,
    value: PropTypes.bool,
    disabled: PropTypes.bool
}
  
const styles = EStyleSheet.create({
    settingsToggleContainer: {
        flexDirection: 'row'
    },
    toggleTextContainer: {
        flex: 1,
        paddingLeft: 15,
        flexDirection: 'column',
        justifyContent: 'center'
    },
    toggleTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '$headerGrey'
    },
    settingHeader: {
        color: '$headerGrey',
        fontSize: 26
    }
});