/**
 * Renders the multi-task "Back" button when the chain has at least one
 * completed task in history. On press it dispatches `goBack`, restoring the
 * prior task; the body's lazy `useState` initializer reads the slice and
 * re-mounts with the user's prior selection visible.
 */

import React from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

import FontedText from '../common/FontedText'
import { goBack } from '../../reducers/classifierSlice'

const ChainBackButton = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const hasHistory = useSelector(
    (state) => (state.classification?.taskHistory?.length ?? 0) > 0
  )
  if (!hasHistory) return null
  const isTablet = DeviceInfo.isTablet()
  return (
    <TouchableOpacity
      style={[styles.button, { height: isTablet ? 44 : 40 }]}
      onPress={() => dispatch(goBack())}
      accessibilityRole="button"
    >
      <FontedText style={styles.text}>
        {t('Mobile.classifier.back', 'Back')}
      </FontedText>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 8,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#005D69',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 21.04,
    color: '#005D69',
  },
})

export default ChainBackButton
