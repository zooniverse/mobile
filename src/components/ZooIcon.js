import React from 'react'
import EStyleSheet from 'react-native-extended-stylesheet'
import {GLOBALS} from '../constants/globals'
import { createIconSet } from 'react-native-vector-icons'

const ZooIconSet = createIconSet(GLOBALS.GLYPHMAP, 'zoo-font', 'zoo-font.ttf')

const ZooIcon = (props) => {
  return (
    <ZooIconSet name={props.iconName} style={[styles.icon, styles[props.iconName]]} />
  )
}

const styles = EStyleSheet.create({
  icon: {
    fontSize: 40,
    color: '$textColor',
  },
  biology: {
    paddingLeft: 10,
  }
});

ZooIcon.propTypes = {
  iconName: React.PropTypes.string.isRequired,
}

export default ZooIcon
