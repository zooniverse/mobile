import React from 'react'
import {
    TouchableOpacity
} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import FontedText from '../common/FontedText'
import PropTypes from 'prop-types'

const NeedHelpButton = (props) => {
    return (
      <TouchableOpacity onPress={props.onPress}>
        <FontedText style={styles.needHelpText}> 
          NEED SOME HELP WITH THIS TASK?
        </FontedText>
      </TouchableOpacity>
    )
}

NeedHelpButton.propTypes = {
    onPress: PropTypes.func
}

const styles = {
    needHelpText: {
        fontSize: DeviceInfo.isTablet() ? 22 : 14,
        textAlign: 'center',
        marginTop: 15,
        color: 'rgba(0,93,105,1)'
    }
}

export default NeedHelpButton
