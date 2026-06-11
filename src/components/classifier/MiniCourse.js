/**
 * Mini-course modal. One step per appearance — never multiple steps in a
 * single view. Intentionally NOT sharing code with `Tutorial.js` or
 * `TutorialStep.js`; mini-course is a separate feature.
 *
 * Prop-driven for content, dispatch-free at this layer. Persistence
 * (advance step, mark complete, persist opt-out) is owned by the parent
 * (`ClassifierScreen`) and wired up in later steps. The checkbox fires
 * `onOptOutChange` immediately on toggle (matches PFE — opt-out saves
 * the moment it's ticked, not on close).
 *
 * `translatedContent` is optional. When provided it overrides the raw
 * `miniCourse.steps[stepIndex].content`; the parent passes it once
 * mini-course translations land in Step 3.
 */

import React, { useEffect, useState } from 'react'
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import Modal from 'react-native-modal'
import Icon from 'react-native-vector-icons/Fontisto'
import Video from 'react-native-video'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'

import FittedImage from '../common/FittedImage'
import FontedText from '../common/FontedText'
import SizedMarkdown from '../common/SizedMarkdown'
import ButtonLarge from './ButtonLarge'

const MediaWidth = Math.min(Dimensions.get('window').width - 100, 400)

const MiniCourse = ({
  isVisible,
  miniCourse,
  stepIndex,
  translatedContent,
  onClose,
  onOptOutChange,
  inMuseumMode = false,
}) => {
  const { t } = useTranslation()
  const [optOut, setOptOut] = useState(false)

  // react-native-modal keeps children mounted when `isVisible` is false, so
  // the local `optOut` value from a previous open can leak into the next.
  // PFE doesn't have this issue because its `Dialog.alert` mounts fresh each
  // time. Reset to false whenever the modal reopens — the trigger gate
  // guarantees opt-out is false at that point (the gate filters out
  // opted-out mini-courses), and restart explicitly clears it.
  useEffect(() => {
    if (isVisible) setOptOut(false)
  }, [isVisible])

  const step = miniCourse?.steps?.[stepIndex]
  if (!step) return null

  const mediaUri = miniCourse?.mediaResources?.[step.media]?.src ?? null
  const isVideo =
    mediaUri && mediaUri.slice(mediaUri.length - 4).match('.mp4')
  const content = translatedContent ?? step.content ?? ''

  const handleOptOutToggle = () => {
    const next = !optOut
    setOptOut(next)
    onOptOutChange?.(next)
  }

  const buttonLabel = optOut
    ? `${t('classifier.optOut', 'Opt out')} →`
    : t('classifier.close', 'Close')

  return (
    <Modal isVisible={isVisible} animationIn="slideInUp" animationOut="slideOutDown">
      <View style={styles.container}>
        <View style={styles.closeRow}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('classifier.close', 'Close')}
          >
            <Icon name="close" color="#005D69" size={22} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {isVideo ? (
            <View style={styles.mediaContainer}>
              <Video
                source={{ uri: mediaUri }}
                style={{
                  width: MediaWidth,
                  height: (MediaWidth / 4) * 3.4,
                }}
                controls={Platform.OS === 'ios'}
                repeat={true}
                resizeMode="contain"
              />
            </View>
          ) : mediaUri ? (
            <View style={styles.mediaContainer}>
              <FittedImage
                maxWidth={MediaWidth}
                maxHeight={MediaWidth}
                source={{ uri: mediaUri }}
              />
            </View>
          ) : null}

          <View style={styles.markdown}>
            <SizedMarkdown inMuseumMode={inMuseumMode}>{content}</SizedMarkdown>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.optOutRow}
          onPress={handleOptOutToggle}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: optOut }}
          accessibilityLabel={t(
            'classifier.dontShowMinicourse',
            'Do not show mini-course in the future'
          )}
        >
          <Icon
            name={optOut ? 'checkbox-active' : 'checkbox-passive'}
            size={18}
            color="#005D69"
          />
          <FontedText style={styles.optOutLabel}>
            {t(
              'classifier.dontShowMinicourse',
              'Do not show mini-course in the future'
            )}
          </FontedText>
        </TouchableOpacity>

        <View style={styles.actionContainer}>
          <ButtonLarge text={buttonLabel} onPress={onClose} />
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 18,
    maxHeight: '85%',
  },
  closeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  content: {
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  mediaContainer: {
    alignSelf: 'center',
    width: MediaWidth,
    marginBottom: 12,
  },
  markdown: {
    flex: 1,
  },
  optOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 6,
  },
  optOutLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#222',
    flexShrink: 1,
  },
  actionContainer: {
    width: 190,
    marginTop: 12,
    alignSelf: 'center',
  },
})

MiniCourse.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  miniCourse: PropTypes.shape({
    id: PropTypes.string,
    steps: PropTypes.arrayOf(
      PropTypes.shape({
        content: PropTypes.string,
        media: PropTypes.string,
      })
    ),
    mediaResources: PropTypes.object,
  }),
  stepIndex: PropTypes.number.isRequired,
  translatedContent: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onOptOutChange: PropTypes.func,
  inMuseumMode: PropTypes.bool,
}

export default MiniCourse
