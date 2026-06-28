/**
 * Renders the task's question text, with markdown support and an optional
 * inline image. Fresh replacement for the legacy `Question.js`.
 */

import React from 'react'
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'

import SizedMarkdown from '../common/SizedMarkdown'
import {
  extractFirstLinkedImageFrom,
  removeImagesFrom,
} from '../../utils/markdownUtils'
import { getCurrentProjectLanguage } from '../../i18n'

const TaskQuestion = ({ task, taskKey, inMuseumMode = false, onPressImage }) => {
  const { t } = useTranslation()

  // Question tasks use `task.question`; drawing tasks use `task.instruction`
  // (matches legacy `Question.js`'s `isDrawClassifier` branching).
  const fieldName = task?.question != null ? 'question' : 'instruction'
  const backupText = task?.[fieldName]
  const translationPath = `workflow.tasks.${taskKey}.${fieldName}`
  const questionTranslated = t(translationPath, backupText, {
    ns: 'project',
    lng: getCurrentProjectLanguage(),
  })

  // Question markdown may contain an inline image. We pull it out and show
  // it as a tappable thumbnail next to the text.
  const imageSource = extractFirstLinkedImageFrom(questionTranslated)
  const questionText = removeImagesFrom(questionTranslated)

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <SizedMarkdown inMuseumMode={inMuseumMode}>
          {questionText}
        </SizedMarkdown>
      </View>
      {imageSource && (
        <TouchableOpacity
          onPress={() => onPressImage?.(imageSource, questionText)}
          style={styles.imageContainer}
        >
          <Image
            source={{ uri: imageSource }}
            style={styles.image}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    marginTop: 10,
    marginHorizontal: 20,
  },
  textContainer: {
    flex: 1,
  },
  imageContainer: {
    paddingLeft: 15,
    paddingBottom: 10,
    width: 100,
    height: 100,
  },
  image: {
    flex: 1,
  },
})

export default TaskQuestion
