import React from 'react';
import {
    View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import PropTypes from 'prop-types';

const Separator = ({style, color}) => {
    const propStyle = {
        borderBottomColor: color
    }
    return (
        <View style={[styles.defaultStyle, style, propStyle]} />
    );
}

const styles = EStyleSheet.create({
    defaultStyle: {
        borderBottomColor: '$borderGrey',
        borderBottomWidth: 1,
        maxHeight: 0,
        flex: 1
    }
})

Separator.propTypes = {
    style: PropTypes.any,
    color: PropTypes.string
}

export default Separator;