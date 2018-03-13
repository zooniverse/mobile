import React from 'react';
import {
    View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import PropTypes from 'prop-types';

const Separator = ({style}) => {
    return (
        <View style={[styles.defaultStyle, style]} />
    );
}

const styles = EStyleSheet.create({
    defaultStyle: {
        borderBottomColor: '#cbcccb',
        borderBottomWidth: 1,
        flex: 1
    }
})

Separator.propTypes = {
    style: PropTypes.any
}

export default Separator;