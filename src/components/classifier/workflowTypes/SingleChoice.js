/**
 * Workflow-type body for single-choice ("single") task workflows.
 *
 * Owns: subject viewer, single-select answer buttons, submit button.
 * Uses `addAnnotationToTask` + `saveClassification` (legacy pattern).
 * Integrates correct/incorrect feedback modal when feedback is active.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

import SubjectViewer from '../SubjectViewer'
import AnswerButtons from '../AnswerButtons'
import ButtonLarge from '../ButtonLarge'
import FeedbackModal from '../FeedbackModal'
import { submitChoiceClassification } from '../../../actions/choiceClassification'
import useFeedbackFlow from '../../../hooks/useFeedbackFlow'

const SingleChoice = ({ subject, task, taskKey, workflow, project, onAdvance, onExpandMedia }) => {
  const { t } = useTranslation()
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 })
  const subjectStartTimeRef = useRef(new Date().toISOString())
  const scrollViewRef = useRef(null)

  // Refresh the start-time stamp whenever we're looking at a new subject.
  useEffect(() => {
    subjectStartTimeRef.current = new Date().toISOString()
  }, [subject?.id])
  const { feedbackModal, withFeedback } = useFeedbackFlow(workflow, project)

  // Global-ish state we still pull from Redux for now. Step 4 moves these
  // out of Redux; for now, reading them here keeps the submit function
  // free of any Redux concerns.
  const sessionId = useSelector((state) => state?.main?.session?.id)
  const viewport = useSelector((state) => ({
    width: state?.app?.device?.width,
    height: state?.app?.device?.height,
  }))
  const isPreviewMode = useSelector((state) => state?.classifier?.inPreviewMode)

  // Matches legacy: after selecting an answer, scroll to the submit button.
  const handleSelect = useCallback((index) => {
    setSelectedIndex(index)
    setTimeout(() => scrollViewRef.current?.scrollToEnd?.(), 300)
  }, [])

  const submit = useCallback(
    (feedbackMeta) => {
      submitChoiceClassification({
        workflow,
        subject,
        annotations: [{ task: taskKey, value: selectedIndex }],
        startTime: subjectStartTimeRef.current,
        displayDimensions,
        viewport,
        sessionId,
        feedbackMeta,
        isPreviewMode,
      })
      setSelectedIndex(-1)
      onAdvance?.()
    },
    [
      workflow,
      subject,
      taskKey,
      selectedIndex,
      displayDimensions,
      viewport,
      sessionId,
      isPreviewMode,
      onAdvance,
    ]
  )

  const handleSubmit = useCallback(() => {
    // Matches legacy: reset scroll before showing feedback modal or submitting.
    scrollViewRef.current?.scrollTo?.({ x: 0, y: 0 })
    withFeedback(subject, selectedIndex, submit)
  }, [subject, selectedIndex, withFeedback, submit])

  return (
    <>
      <View
        style={styles.subjectArea}
        onLayout={(e) => setDisplayDimensions(e.nativeEvent.layout)}
      >
        <SubjectViewer
          subject={subject}
          onPress={onExpandMedia}
        />
      </View>
      <View style={styles.flex}>
        <ScrollView ref={scrollViewRef}>
          <View style={styles.answersPadding}>
            <AnswerButtons
              answers={task?.answers || []}
              taskKey={taskKey}
              selectedIndex={selectedIndex}
              onSelect={handleSelect}
            />
          </View>
          <View style={styles.submitContainer}>
            <ButtonLarge
              disabled={selectedIndex === -1}
              text={t('Mobile.classifier.submit', 'Submit')}
              onPress={handleSubmit}
            />
          </View>
        </ScrollView>
      </View>
      {feedbackModal?.show && (
        <FeedbackModal
          correct={feedbackModal.correct}
          message={feedbackModal.message}
          onClose={feedbackModal.onClose}
          inMuseumMode={project.in_museum_mode}
        />
      )}
    </>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  subjectArea: {
    flex: 1,
  },
  answersPadding: {
    paddingVertical: 15,
  },
  submitContainer: {
    marginTop: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
})

export default SingleChoice
