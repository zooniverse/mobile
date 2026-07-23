/**
 * Renders the TASK / TUTORIAL tabs at the top of a content area. Fresh
 * functional replacement for the legacy class-based `ClassificationPanel.js`.
 *
 * The parent controls which tab is active via `isQuestionVisible` and is
 * responsible for rendering the right body (task content vs tutorial) as
 * children.
 */

import React from 'react'
import {
  Platform,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import FontAwesome from '@react-native-vector-icons/fontawesome/static'
import { useTranslation } from 'react-i18next'

import FontedText from '../common/FontedText'

const TaskPanel = ({
  isQuestionVisible,
  setQuestionVisibility,
  hasTutorial,
  containerStyle,
  children,
}) => {
  const { t } = useTranslation()

  const iconSize = DeviceInfo.isTablet() ? 22 : 18
  const tutorialColor = hasTutorial ? '#005D69' : '#A6A7A9'
  const taskIconPadding = Platform.OS === 'android' ? 4 : 2
  const tutorialIconPadding = Platform.OS === 'android' ? 2 : 1

  const activeTab = { backgroundColor: '#EBEBEB' }
  const inactiveTab = { backgroundColor: '#CBCCCB' }
  const tabLeftStyle = isQuestionVisible ? activeTab : inactiveTab
  const tabRightStyle = isQuestionVisible ? inactiveTab : activeTab
  const tabLeftFontWeight = isQuestionVisible ? '700' : '400'
  const tabRightFontWeight = isQuestionVisible ? '400' : '700'

  // If there's no tutorial, the tab is still shown but not tappable
  // (matches legacy behavior).
  const TutorialTab = ({ children: content }) =>
    hasTutorial ? (
      <TouchableOpacity
        onPress={() => setQuestionVisibility(false)}
        style={[styles.tab, tabRightStyle]}
      >
        {content}
      </TouchableOpacity>
    ) : (
      <View style={[styles.tab, tabRightStyle]}>{content}</View>
    )

  return (
    <View style={containerStyle}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setQuestionVisibility(true)}
          style={[styles.tab, tabLeftStyle]}
        >
          <FontAwesome
            name="pencil-square-o"
            size={iconSize}
            color="#005D69"
            style={{ paddingTop: taskIconPadding }}
          />
          <FontedText
            style={[
              styles.tabText,
              {
                fontWeight: tabLeftFontWeight,
                color: tutorialColor,
                textTransform: 'uppercase',
              },
            ]}
          >
            {t('classifier.taskTabs.taskTab', 'TASK')}
          </FontedText>
        </TouchableOpacity>
        <TutorialTab>
          <FontAwesome
            name="question-circle-o"
            size={iconSize}
            color={tutorialColor}
            style={{ paddingTop: tutorialIconPadding }}
          />
          <FontedText
            style={[
              styles.tabText,
              {
                fontWeight: tabRightFontWeight,
                color: tutorialColor,
                textTransform: 'uppercase',
              },
            ]}
          >
            {t('classifier.taskTabs.tutorialTab', 'TUTORIAL')}
          </FontedText>
        </TutorialTab>
      </View>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'row',
    height: 44,
  },
  tabText: {
    fontSize: DeviceInfo.isTablet() ? 22 : 16,
    letterSpacing: 1,
    marginLeft: 8,
  },
})

export default TaskPanel
