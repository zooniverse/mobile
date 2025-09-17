import React from 'react'
import EStyleSheet from 'react-native-extended-stylesheet'
import { CheckboxField } from 'react-native-checkbox-field'
import Icon from 'react-native-vector-icons/FontAwesome'
import PropTypes from 'prop-types';

const Checkbox = (props) => {
  const containerStyle = ( props.leftAligned ? [styles.checkboxContainerStyle, styles.leftAligned] : styles.checkboxContainerStyle )

  return (
    <CheckboxField
        onSelect={props.onSelect}
        selected={props.selected}
        defaultColor='white'
        selectedColor='#1995ea'
        containerStyle={containerStyle}
        checkboxStyle={styles.checkboxStyle}>
        <Icon name="check" style={styles.icon} />
    </CheckboxField>
  )
}

const styles = EStyleSheet.create({
  checkboxContainerStyle: {
      flex: 1,
      flexDirection: 'row',
      padding: 20,
      paddingRight: 8,
      alignItems: 'center'
  },
  leftAligned: {
    paddingLeft: 3
  },
  checkboxStyle: {
      width: 20,
      height: 20,
      borderWidth: 1,
      borderColor: '$lightGrey',
      borderRadius: 5
  },
  icon: {
    fontSize: 16,
    color: 'white',
  },
})

Checkbox.propTypes = {
  onSelect: PropTypes.func,
  selected: PropTypes.bool,
  leftAligned: PropTypes.bool,
}

export default Checkbox
