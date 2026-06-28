/**
 * Workflow-type body for single-choice ("single") task workflows.
 *
 * Owns: subject viewer, single-select answer buttons, submit button.
 * Uses `addAnnotationToTask` + `saveClassification` (legacy pattern).
 * Integrates correct/incorrect feedback modal when feedback is active.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

import SubjectViewer from '../SubjectViewer'
import AnswerButtons from '../AnswerButtons'
import ButtonLarge from '../ButtonLarge'
import ChainBackButton from '../ChainBackButton'
import FeedbackModal from '../FeedbackModal'
import { submitChoiceClassification } from '../../../actions/choiceClassification'
import useFeedbackFlow from '../../../hooks/useFeedbackFlow'
import { isMultiTaskWorkflow, getNextTaskKey } from '../../../utils/taskChain'
import {
  advanceTo,
  incrementClassificationCount,
  recordAnnotation,
  selectActiveAnnotations,
  startChain,
} from '../../../reducers/classifierSlice'

/**
 * Submit button label rules: Phase 2 multi-task workflows show "Next" or
 * "Done" depending on whether the chain continues; legacy single-task
 * workflows keep "Submit" so existing UX is unchanged.
 */
const resolveSubmitLabel = ({ isMulti, nextTaskKey, t }) => {
  if (!isMulti) return t('Mobile.classifier.submit', 'Submit')
  if (nextTaskKey !== null) return t('Mobile.classifier.next', 'Next')
  return t('Mobile.classifier.done', 'Done')
}

const SingleChoice = ({ subject, task, taskKey, workflow, project, onAdvance, onExpandMedia }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()

  // Restore the prior selection if the user just navigated Back to this task.
  // The slice keeps the recorded annotation; we lazy-init from it so the body
  // mounts with the correct radio button highlighted.
  const priorAnnotations = useSelector(selectActiveAnnotations)
  const initialSelectedIndex = useState(() => {
    const prior = priorAnnotations.find((a) => a?.task === taskKey)
    return typeof prior?.value === 'number' ? prior.value : -1
  })[0]
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex)
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
  const isGuestUser = useSelector((state) => state?.user?.isGuestUser)

  // Matches legacy: after selecting an answer, scroll to the submit button.
  const handleSelect = useCallback((index) => {
    setSelectedIndex(index)
    setTimeout(() => scrollViewRef.current?.scrollToEnd?.(), 300)
  }, [])

  const finalize = useCallback(
    (feedbackMeta) => {
      const annotation = { task: taskKey, value: selectedIndex }
      // Combine annotations from earlier tasks in the chain (if any) with
      // this task's. `priorAnnotations` may already include a stale entry
      // for this task if the user advanced, came back, and re-submits; we
      // overwrite by keying on `task`.
      const annotations = [
        ...priorAnnotations.filter((a) => a?.task !== taskKey),
        annotation,
      ]
      submitChoiceClassification({
        workflow,
        subject,
        annotations,
        startTime: subjectStartTimeRef.current,
        displayDimensions,
        viewport,
        sessionId,
        feedbackMeta,
        isPreviewMode,
      })
      setSelectedIndex(-1)
      // Clear chain state so the next subject begins at first_task with
      // no carried-over annotations. For single-task workflows this is a
      // no-op aside from resetting `currentTaskKey` to its existing value.
      dispatch(startChain({ taskKey: workflow.first_task }))
      if (!isGuestUser) dispatch(incrementClassificationCount())
      onAdvance?.()
    },
    [
      dispatch,
      workflow,
      subject,
      taskKey,
      selectedIndex,
      displayDimensions,
      viewport,
      sessionId,
      isPreviewMode,
      priorAnnotations,
      onAdvance,
      isGuestUser,
    ]
  )

  const advanceChain = useCallback(
    (toTaskKey) => {
      const annotation = { task: taskKey, value: selectedIndex }
      dispatch(recordAnnotation({ taskKey, annotation }))
      dispatch(
        advanceTo({
          fromTaskKey: taskKey,
          answerValue: selectedIndex,
          toTaskKey,
        })
      )
      // Body unmounts via `key={currentTaskKey}` in the shell; no need to
      // reset local state here.
    },
    [dispatch, taskKey, selectedIndex]
  )

  const handleSubmit = useCallback(() => {
    // Multi-task: branch through the chain when this task has a `next`
    // (per-answer for single-choice, falling back to `task.next`).
    const nextTaskKey = isMultiTaskWorkflow(workflow)
      ? getNextTaskKey(task, selectedIndex)
      : null
    if (nextTaskKey !== null) {
      advanceChain(nextTaskKey)
      return
    }
    // Matches legacy: reset scroll before showing feedback modal or submitting.
    scrollViewRef.current?.scrollTo?.({ x: 0, y: 0 })
    withFeedback(subject, selectedIndex, finalize)
  }, [workflow, task, subject, selectedIndex, withFeedback, finalize, advanceChain])

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
            <ChainBackButton />
            <ButtonLarge
              disabled={selectedIndex === -1}
              text={resolveSubmitLabel({
                isMulti: isMultiTaskWorkflow(workflow),
                nextTaskKey:
                  selectedIndex === -1 ? null : getNextTaskKey(task, selectedIndex),
                t,
              })}
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
