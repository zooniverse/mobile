/**
 * Workflow-type body for multi-select ("multiple") task workflows.
 *
 * Owns: subject viewer, multi-select answer buttons (toggle behavior),
 * submit button. Submission uses the legacy `addAnnotationToTask`
 * (asList=false — the whole selected-indices array is the annotation
 * value, not an item to push onto a list) + `saveClassification` pair,
 * same as the legacy `MultiAnswerClassifier`.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

import SubjectViewer from '../SubjectViewer'
import AnswerButtons from '../AnswerButtons'
import ButtonLarge from '../ButtonLarge'
import ChainBackButton from '../ChainBackButton'
import { submitChoiceClassification } from '../../../actions/choiceClassification'
import { isMultiTaskWorkflow, getNextTaskKey } from '../../../utils/taskChain'
import {
  advanceTo,
  incrementClassificationCount,
  recordAnnotation,
  selectActiveAnnotations,
  startChain,
} from '../../../reducers/classifierSlice'

const MultiSelect = ({ subject, task, taskKey, workflow, project, onAdvance, onExpandMedia }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()

  // Restore prior selection on Back navigation — slice keeps the recorded
  // array so the toggles re-render with the user's previous picks.
  const priorAnnotations = useSelector(selectActiveAnnotations)
  const initialSelectedIndices = useState(() => {
    const prior = priorAnnotations.find((a) => a?.task === taskKey)
    return Array.isArray(prior?.value) ? prior.value : []
  })[0]
  const [selectedIndices, setSelectedIndices] = useState(initialSelectedIndices)
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 })
  const subjectStartTimeRef = useRef(new Date().toISOString())
  const scrollViewRef = useRef(null)

  // Refresh the start-time stamp whenever we're looking at a new subject.
  useEffect(() => {
    subjectStartTimeRef.current = new Date().toISOString()
  }, [subject?.id])

  // Global-ish state still pulled from Redux for now. Step 4 moves these
  // out so the submit call becomes fully prop-driven.
  const sessionId = useSelector((state) => state?.main?.session?.id)
  const viewport = useSelector((state) => ({
    width: state?.app?.device?.width,
    height: state?.app?.device?.height,
  }))
  const isPreviewMode = useSelector((state) => state?.classifier?.inPreviewMode)
  const isGuestUser = useSelector((state) => state?.user?.isGuestUser)

  // Matches legacy: after toggling an answer, scroll to the submit button.
  const onSelect = useCallback((index) => {
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
    setTimeout(() => scrollViewRef.current?.scrollToEnd?.(), 300)
  }, [])

  const handleSubmit = useCallback(() => {
    // Multi-task chain: multi-select itself never branches per-answer (the
    // builder doesn't expose that), so we only honor `task.next`.
    const nextTaskKey = isMultiTaskWorkflow(workflow) ? getNextTaskKey(task) : null
    const annotation = { task: taskKey, value: selectedIndices }

    if (nextTaskKey !== null) {
      dispatch(recordAnnotation({ taskKey, annotation }))
      dispatch(
        advanceTo({
          fromTaskKey: taskKey,
          answerValue: selectedIndices,
          toTaskKey: nextTaskKey,
        })
      )
      return
    }

    // Matches legacy: reset scroll before submitting.
    scrollViewRef.current?.scrollTo?.({ x: 0, y: 0 })
    // `asList=false` semantics preserved: the array of selected indices is
    // itself the annotation value, not items to push onto a list.
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
      isPreviewMode,
    })
    setSelectedIndices([])
    dispatch(startChain({ taskKey: workflow.first_task }))
    if (!isGuestUser) dispatch(incrementClassificationCount())
    onAdvance?.()
  }, [
    dispatch,
    workflow,
    task,
    subject,
    taskKey,
    selectedIndices,
    displayDimensions,
    viewport,
    sessionId,
    isPreviewMode,
    priorAnnotations,
    onAdvance,
    isGuestUser,
  ])

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
              selectedIndices={selectedIndices}
              multiSelect
              onSelect={onSelect}
            />
          </View>
          <View style={styles.submitContainer}>
            <ChainBackButton />
            <ButtonLarge
              // In a multi-task workflow we surface FEM's "Done disabled until
              // a selection is made" rule. Legacy single-task multi-select
              // keeps the always-enabled behavior.
              disabled={
                isMultiTaskWorkflow(workflow) && selectedIndices.length === 0
              }
              text={
                !isMultiTaskWorkflow(workflow)
                  ? t('Mobile.classifier.submit', 'Submit')
                  : getNextTaskKey(task) !== null
                    ? t('Mobile.classifier.next', 'Next')
                    : t('Mobile.classifier.done', 'Done')
              }
              onPress={handleSubmit}
            />
          </View>
        </ScrollView>
      </View>
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

export default MultiSelect
