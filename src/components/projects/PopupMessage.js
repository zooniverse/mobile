import React from 'react';
import {
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import Icon from 'react-native-vector-icons/FontAwesome'

import FontedText from '../common/FontedText'

const PopupMessage = () => {
  return (
      <View style={[styles.container]}>
        <View style={styles.content}>
          <FontedText style={[styles.text]}> Please choose a workflow </FontedText>
          <Icon name='angle-double-down' style={styles.icon} />
        </View>
      </View>
  )
}

const styles = EStyleSheet.create({
  container: {
    borderColor: '$darkGreyTextColor',
    justifyContent:  'flex-end',
    alignItems: 'center',
  },
  content: {
    borderRadius: 6,
    backgroundColor: '$darkGreyTextColor',
    justifyContent:  'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  text: {
    color: 'white',
  },
  icon: {
    color: 'white',
    fontSize: 14,
  }
});

export default PopupMessage
