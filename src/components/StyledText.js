import React from 'react'
import {
  Text
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

const StyledText = (props) => {
  const textStyle = ( props.textStyle ? [styles.defaultText, styles[props.textStyle]] : styles.defaultText )

  return (
    <Text style={textStyle}>
      {props.text}
    </Text>
  )
}

const styles = EStyleSheet.create({
  defaultText: {
    fontFamily: 'OpenSans',
    fontSize: 14,
  },
  headerText: {
    fontSize: 18,
    letterSpacing: 1.5,
    marginBottom: 5
  },
  errorMessage: {
    color: 'red',
    marginBottom: 10,
    lineHeight: 24
  },
  link: {
    color: '$headerColor'
  },
  smallLink: {
    fontSize: 12,
    color: '$headerColor'
  },
  small: {
    fontSize: 12,
  },
  largeLink: {
    color: '$darkTextColor',
    fontSize: 20,
  },
  large: {
    fontSize: 20,
  },
  largeBold: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  citation: {
    color: 'grey',
    fontStyle: 'italic',
    fontSize: 12,
    flex: 1,
  },
  fullHeight: {
    height: '100%'
  },
  subLabelText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '$grey',
  }
});

StyledText.propTypes = {
  text: React.PropTypes.string,
  textStyle: React.PropTypes.string,
}

export default StyledText
