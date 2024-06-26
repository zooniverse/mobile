import React, { Component } from 'react'
import {
    TouchableOpacity
} from 'react-native'
import FontedText from '../common/FontedText'
import PropTypes from 'prop-types'


export class NeedHelpButton extends Component {

    render() {
        return (
            <TouchableOpacity onPress={this.props.onPress} style={styles.container}>
                <FontedText style={styles.needHelpText}>
                    I NEED HELP WITH THIS TASK
                </FontedText>
            </TouchableOpacity>
        )
    }
}

NeedHelpButton.propTypes = {
    onPress: PropTypes.func,
    inMuseumMode: PropTypes.bool,
}

NeedHelpButton.defaultProps = {
    inMuseumMode: false,
}

const styles = {
    container: {
        marginBottom: 12,
    },
    needHelpText: {
        fontSize: 12,
        lineHeight: 14.03,
        letterSpacing: 0.5,
        color: '#272727'
    }
}

export default NeedHelpButton
