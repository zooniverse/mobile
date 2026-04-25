/**
 * Workflow-type body for swipe ("swipe") workflows — single-choice tasks
 * with exactly two answers, classified via left/right swipe gestures.
 *
 * Owns the pieces unique to this workflow type:
 * - Subject queue with next-card prefetch (`useSubjectQueue`, `useImagePrefetch`)
 * - Swipe gesture handling (`useSwiperGesture`)
 * - Card rendering with current + next cards for instance preservation
 * - SwiperTabs (left/right programmatic buttons)
 * - No Submit button — the swipe gesture IS the submit action
 *
 * The shared shell (`ClassifierScreen`) provides header, tabs, question,
 * help, and field guide around this body. All gesture, prefetch, and
 * submission logic is ported from the legacy `SwiperClassifier`; the
 * sub-components (`SwiperCard`, `SwiperTabs`) and hooks are reused as-is.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useDispatch, useSelector } from 'react-redux'
import R from 'ramda'

import useSubjectQueue from '../../../hooks/useSubjectQueue'
import useImagePrefetch from '../../../hooks/useImagePrefetch'
import useSwiperGesture from '../../../hooks/useSwiperGesture'
import useFeedbackFlow from '../../../hooks/useFeedbackFlow'
import SwiperCard from '../Swiper/SwiperCard'
import SwiperTabs from '../Swiper/SwiperTabs'
import FeedbackModal from '../FeedbackModal'
import UnlinkedTask from '../UnlinkedTask'

import * as classifierActions from '../../../actions/classifier'
import { submitSwiperClassification } from '../../../actions/swiperClassification'

const Swipe = ({ workflow, project, task, onExpandMedia }) => {
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
  const annotations = useSelector(
    (state) => state.classifier.annotations[workflow.id] || {}
  )

  const [cardDimensions, setCardDimensions] = useState({ width: 1, height: 1 })
  const hasDimensions = cardDimensions.width > 1 && cardDimensions.height > 1

  const subjectStartTimeRef = useRef(null)
  const prevSubjectIdRef = useRef(null)

  const {
    queue,
    currentIndex,
    currentSubject,
    nextSubject,
    hasSubjects,
    fetchMoreSubjects,
    advanceToNextSubject,
  } = useSubjectQueue(workflow.id)

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
      })
      advanceToNextSubject()
      subjectStartTimeRef.current = new Date().toISOString()
    },
    [
      workflow,
      getDimensions,
      cardDimensions,
      viewport,
      sessionId,
      inPreviewMode,
      advanceToNextSubject,
    ]
  )

  const onSwipeComplete = useCallback(
    (direction) => {
      if (!currentSubject) return
      const answer = direction === 'right' ? 0 : 1
      const startTime = subjectStartTimeRef.current
      withFeedback(currentSubject, answer, (feedbackMeta) => {
        doSubmit(answer, currentSubject, startTime, feedbackMeta)
      })
    },
    [currentSubject, doSubmit, withFeedback]
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
  const cards = [nextSubject, currentSubject].filter(Boolean)
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
