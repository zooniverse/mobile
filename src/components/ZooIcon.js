import React from 'react'
import { Text } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import {GLOBALS} from '../constants/globals'
import PropTypes from 'prop-types';

const ZooIcon = (props) => {
  return (
    <Text style={[styles.icon, styles[props.iconName]]}>
      {String.fromCodePoint(GLOBALS.GLYPHMAP[props.iconName])}
    </Text>
  )
}

const styles = EStyleSheet.create({
  icon: {
    fontSize: 40,
    fontFamily: 'zoo-font',
    color: '$textColor',
  },
  biology: {
    paddingLeft: 10,
  }
});

ZooIcon.propTypes = {
  iconName: PropTypes.string.isRequired,
}

export default ZooIcon
