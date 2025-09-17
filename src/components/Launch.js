import React from 'react'
import { Image } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

const Launch = () => {
  return (
    <Image source={require('../../images/fulllaunch.png')} style={styles.container} />
  )
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    width: null,
    height: null,
  },
})

export default Launch
