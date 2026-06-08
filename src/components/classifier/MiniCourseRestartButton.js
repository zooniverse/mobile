/**
 * Low-visual-weight text link to restart a mini-course. Mirrors PFE's
 * `MinicourseButton` (rendered at the bottom of the classifier panel).
 *
 * Prop-driven: parent decides whether to render at all (skip for guests
 * or when no mini-course is attached) and supplies the `onPress` handler.
 * The button itself stays dumb — no Redux, no auth check.
 */

import React from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'

import FontedText from '../common/FontedText'

const MiniCourseRestartButton = ({ onPress }) => {
  const { t } = useTranslation()

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t(
        'classifier.miniCourseButton',
        'Restart the project mini-course'
      )}
      style={styles.button}
    >
      <FontedText style={styles.label}>
        {t(
          'classifier.miniCourseButton',
          'Restart the project mini-course'
        )}
      </FontedText>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  label: {
    color: '#005D69',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
})

MiniCourseRestartButton.propTypes = {
  onPress: PropTypes.func.isRequired,
}

export default MiniCourseRestartButton
