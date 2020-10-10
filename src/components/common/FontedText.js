import React from 'react'
import {
  Text,
} from 'react-native'
import PropTypes from 'prop-types';

/**
 * This class is basically a wrapper around the Text class, but assigns our style guide font automatically.
 * FontedText should be used in place of Text whenever you want to use the styleguide font, Karla
 * 
 **/

const FontedText = ({style, children, ...otherProps}) => {    
    return (
        <Text {...otherProps} style={[styles.fontStyle ,style]}> 
            {children}
        </Text>
    )
}

export default FontedText;

const styles = {
    fontStyle: {
        fontFamily: 'Karla',
    }
}

FontedText.propTypes = {
    children: PropTypes.any,
    style: PropTypes.any
}