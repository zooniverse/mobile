import React from 'react';
import {
    View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import PropTypes from 'prop-types';

import * as colorModes from '../../actions/colorModes'

const Separator = ({style, color, inMuseumMode}) => {
    let separatorStyle = [styles.defaultStyle, colorModes.separatorColorFor(inMuseumMode)]
    if (color) {
        separatorStyle.push({borderBottomColor: color})
    }

    return (
        <View style={style}>
            <View style={separatorStyle} />
        </View>
    );
}

const styles = EStyleSheet.create({
    defaultStyle: {
        borderBottomWidth: 1,
        maxHeight: 0,
        flex: 1
    }
})

Separator.propTypes = {
    style: PropTypes.any,
    color: PropTypes.string,
    inMuseumMode: PropTypes.bool,
}

Separator.defaultProps = {
    inMuseumMode: false
}

export default Separator;