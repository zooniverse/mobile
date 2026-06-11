/**
 * Workflow-type body for swipe ("swipe") workflows — single-choice tasks
 * with exactly two answers, classified via left/right swipe gestures.
 *
 * Owns the pieces unique to this workflow type:
 * - Image prefetch on top of the shell-owned queue (`useImagePrefetch`)
 * - Swipe gesture handling (`useSwiperGesture`)
 * - Card rendering with current + next cards for instance preservation
 * - SwiperTabs (left/right programmatic buttons)
 * - No Submit button — the swipe gesture IS the submit action
 *
 * Phase 2 lifted the subject queue into `ClassifierScreen` so a chain
 * advance from a Swipe T0 to a non-Swipe T1 doesn't lose the active
 * subject. The body is now prop-driven for queue state.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useDispatch, useSelector } from 'react-redux'
import R from 'ramda'

import useImagePrefetch from '../../../hooks/useImagePrefetch'
import useSwiperGesture from '../../../hooks/useSwiperGesture'
import useFeedbackFlow from '../../../hooks/useFeedbackFlow'
import SwiperCard from '../Swiper/SwiperCard'
import SwiperTabs from '../Swiper/SwiperTabs'
import FeedbackModal from '../FeedbackModal'
import UnlinkedTask from '../UnlinkedTask'

import * as classifierActions from '../../../actions/classifier'
import { submitSwiperClassification } from '../../../actions/swiperClassification'
import { isMultiTaskWorkflow, getNextTaskKey } from '../../../utils/taskChain'
import {
  advanceTo,
  incrementClassificationCount,
  recordAnnotation,
  selectActiveAnnotations,
  startChain,
} from '../../../reducers/classifierSlice'

const Swipe = ({
  workflow,
  project,
  task,
  taskKey,
  subject: currentSubject,
  nextSubject,
  queue,
  currentIndex,
  hasSubjects,
  fetchMoreSubjects,
  onAdvance,
  onExpandMedia,
}) => {
  const dispatch = useDispatch()

  // Legacy reversal: answers[0] becomes the "left/No" button, answers[1]
  // becomes the "right/Yes" button in SwiperTabs.
  const answers = R.reverse(task?.answers || [])

  const inPreviewMode = useSelector((state) => state.classifier.inPreviewMode)
  const viewport = useSelector((state) => ({
    width: state.app.device.width,
    height: state.app.device.height,
  }))
  const sessionId = useSelector((state) => state.main.session?.id)
  const isGuestUser = useSelector((state) => state?.user?.isGuestUser)
  const annotations = useSelector(
    (state) => state.classifier.annotations[workflow.id] || {}
  )
  const priorAnnotations = useSelector(selectActiveAnnotations)

  const [cardDimensions, setCardDimensions] = useState({ width: 1, height: 1 })
  const hasDimensions = cardDimensions.width > 1 && cardDimensions.height > 1

  const subjectStartTimeRef = useRef(null)
  const prevSubjectIdRef = useRef(null)

  const { isReady, getDimensions } = useImagePrefetch(queue, currentIndex)
  const { feedbackModal, withFeedback } = useFeedbackFlow(workflow, project)

  // Submit the classification and advance the queue.
  const doSubmit = useCallback(
    (answer, subject, startTime, feedbackMeta = null) => {
      submitSwiperClassification({
        workflow,
        subject,
        answer,
        startTime,
        subjectDimensions: getDimensions(subject.id),
        displayDimensions: cardDimensions,
        viewport,
        sessionId,
        feedbackMeta,
        isPreviewMode: inPreviewMode,
        priorAnnotations: priorAnnotations.filter((a) => a?.task !== taskKey),
        taskKey,
      })
      // Reset chain so the next subject begins at first_task; no-op for
      // single-task swipe workflows.
      dispatch(startChain({ taskKey: workflow.first_task }))
      if (!isGuestUser) dispatch(incrementClassificationCount())
      onAdvance?.()
      subjectStartTimeRef.current = new Date().toISOString()
    },
    [
      dispatch,
      workflow,
      taskKey,
      getDimensions,
      cardDimensions,
      viewport,
      sessionId,
      inPreviewMode,
      priorAnnotations,
      onAdvance,
      isGuestUser,
    ]
  )

  const onSwipeComplete = useCallback(
    (direction) => {
      if (!currentSubject) return
      const answer = direction === 'right' ? 0 : 1
      const startTime = subjectStartTimeRef.current

      // Multi-task: a Swipe task with a `next` (per-answer or task-level)
      // routes to the next task instead of submitting. The same subject
      // continues; the body switches when `currentTask.type` changes.
      const nextTaskKey = isMultiTaskWorkflow(workflow)
        ? getNextTaskKey(task, answer)
        : null
      if (nextTaskKey !== null) {
        const annotation = { task: taskKey, value: answer }
        dispatch(recordAnnotation({ taskKey, annotation }))
        dispatch(
          advanceTo({
            fromTaskKey: taskKey,
            answerValue: answer,
            toTaskKey: nextTaskKey,
          })
        )
        return
      }

      withFeedback(currentSubject, answer, (feedbackMeta) => {
        doSubmit(answer, currentSubject, startTime, feedbackMeta)
      })
    },
    [currentSubject, dispatch, workflow, task, taskKey, doSubmit, withFeedback]
  )

  const { translateX, isSwiping, panGesture, triggerSwipe, resetCard } =
    useSwiperGesture({
      onSwipeComplete,
      enabled: hasSubjects && hasDimensions,
    })

  // Set preview-mode flag on mount (legacy behavior).
  useEffect(() => {
    dispatch(classifierActions.setClassifierTestMode(inPreviewMode))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Kick off initial subject fetch.
  useEffect(() => {
    if (!hasSubjects) {
      fetchMoreSubjects()
    }
  }, [hasSubjects, fetchMoreSubjects])

  // First-time start timestamp.
  useEffect(() => {
    if (currentSubject && !subjectStartTimeRef.current) {
      subjectStartTimeRef.current = new Date().toISOString()
    }
  }, [currentSubject])

  // When the subject changes after a swipe, snap the card back to center.
  useEffect(() => {
    if (
      currentSubject &&
      prevSubjectIdRef.current !== null &&
      currentSubject.id !== prevSubjectIdRef.current
    ) {
      resetCard()
    }
    if (currentSubject) {
      prevSubjectIdRef.current = currentSubject.id
    }
  }, [currentSubject, resetCard])

  // Unlinked-task toggle: matches legacy SwiperClassifier.onUnlinkedTaskAnswered.
  const onUnlinkedTaskAnswered = useCallback(
    (taskKey, value) => {
      const existing = annotations[taskKey] || []
      if (R.contains(value, existing)) {
        dispatch(
          classifierActions.removeAnnotationFromTask(workflow.id, taskKey, value)
        )
      } else {
        dispatch(
          classifierActions.addAnnotationToTask(workflow.id, taskKey, value, true)
        )
      }
    },
    [annotations, workflow.id, dispatch]
  )

  const onCardAreaLayout = useCallback(({ nativeEvent }) => {
    const { width, height } = nativeEvent.layout
    setCardDimensions((prev) =>
      width !== prev.width || height !== prev.height
        ? { width, height }
        : prev
    )
  }, [])

  // Both cards render with the same component type keyed by subject ID
  // so React preserves the component instance (and any Video/image state)
  // when the next card becomes current.
  //
  // Multi-task workflows skip the peek-of-the-next-subject stacking card,
  // since advancing inside a chain stays on the same subject — showing a
  // different subject's image underneath was misleading.
  const cards = isMultiTaskWorkflow(workflow)
    ? [currentSubject].filter(Boolean)
    : [nextSubject, currentSubject].filter(Boolean)
  const alreadySeen = currentSubject?.already_seen || false

  return (
    <>
      <View style={styles.swiperWrapper} onLayout={onCardAreaLayout}>
        {hasDimensions && (
          <GestureHandlerRootView style={styles.gestureRoot}>
            {cards.map((subject) => {
              const isCurrent = subject.id === currentSubject?.id
              return (
                <SwiperCard
                  key={subject.id}
                  subject={subject}
                  isCurrent={isCurrent}
                  isImageReady={isReady(subject.id)}
                  panGesture={panGesture}
                  translateX={translateX}
                  isSwiping={isSwiping}
                  answers={answers}
                  alreadySeen={isCurrent ? alreadySeen : false}
                  inMuseumMode={project.in_museum_mode}
                  onExpandImage={onExpandMedia}
                  containerDimensions={cardDimensions}
                />
              )
            })}
          </GestureHandlerRootView>
        )}
      </View>
      {task?.unlinkedTask && workflow.tasks?.[task.unlinkedTask] && (
        <UnlinkedTask
          unlinkedTaskKey={task.unlinkedTask}
          unlinkedTask={workflow.tasks[task.unlinkedTask]}
          annotation={annotations[task.unlinkedTask]}
          onAnswered={onUnlinkedTaskAnswered}
        />
      )}
      <SwiperTabs
        inMuseumMode={project.in_museum_mode}
        guide={{}}
        onLeftButtonPressed={() => triggerSwipe('left')}
        onRightButtonPressed={() => triggerSwipe('right')}
        onFieldGuidePressed={() => {}}
        answers={answers}
      />
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
  swiperWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  gestureRoot: {
    flex: 1,
  },
})

export default Swipe
