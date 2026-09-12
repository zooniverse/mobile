import React, { useCallback, useEffect, useState } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

import FontedText from '../common/FontedText'

import ClassifierHeader from '../../navigation/ClassifierHeader'
import TaskQuestion from './TaskQuestion'
import NeedHelpButton from './NeedHelpButton'
import HelpModal from './HelpModal'
import FieldGuideBtn from './FieldGuideBtn'
import FieldGuidePanel from './FieldGuidePanel'
import TaskPanel from './TaskPanel'
import Tutorial from './Tutorial'
import MiniCourse from './MiniCourse'
import MiniCourseRestartButton from './MiniCourseRestartButton'
import Separator from '../common/Separator'
import FullScreenMedia from '../FullScreenMedia'
import * as colorModes from '../../displayOptions/colorModes'
import { markdownContainsImage } from '../../utils/markdownUtils'
import useSubjectQueue from '../../hooks/useSubjectQueue'
import useWorkflowResources from '../../hooks/useWorkflowResources'
import useProjectTranslations from '../../hooks/useProjectTranslations'
import useMiniCourseTranslations from '../../hooks/useMiniCourseTranslations'
import {
  setTutorialCompleted,
  setSubjectStartTimeForWorkflow,
  setMiniCourseOptOut,
  setMiniCourseStepProgress,
  setMiniCourseCompleted,
  restartMiniCourse,
} from '../../actions/classifier'
import { setSubjectStartTime, startChain } from '../../reducers/classifierSlice'
import WorkflowTypes from '../../constants/WorkflowTypes'
import TranslationsLoadingIndicator from '../common/TranslationsLoadingIndicator'
import { shouldShowMiniCourse } from '../../utils/miniCourseTrigger'
import { getCurrentProjectLanguage } from '../../i18n'

import SingleChoice from './workflowTypes/SingleChoice'
import MultiSelect from './workflowTypes/MultiSelect'
import Drawing from './workflowTypes/Drawing'
import Swipe from './workflowTypes/Swipe'

const ClassifierScreen = ({ route }) => {
  const { project, workflow } = route.params
  const dispatch = useDispatch()
  const { t } = useTranslation()

  // Phase 2 lifted the subject queue out of the Swipe body so a chain
  // advance from a Swipe T0 to a non-Swipe T1 doesn't lose the active
  // subject. The Swipe body is now prop-driven for queue state.
  const {
    queue,
    currentIndex,
    currentSubject,
    nextSubject,
    hasSubjects,
    isLoading: subjectsLoading,
    advanceToNextSubject,
    fetchMoreSubjects,
  } = useSubjectQueue(workflow.id)

  // Kick off the initial fetch.
  useEffect(() => {
    if (workflow?.id && !currentSubject) {
      fetchMoreSubjects()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow?.id])
  const {
    guide,
    tutorial,
    needsTutorial,
    miniCourse,
    isLoading: resourcesLoading,
  } = useWorkflowResources(workflow, project)
  const { isLoading: translationsLoading } = useProjectTranslations(
    project,
    workflow,
    guide,
    tutorial
  )
  // Mini-course translations live in their own i18next namespace
  // (`miniCourse`) — separate from project/tutorial translations on
  // purpose. The hook is a no-op for guests / workflows without a
  // mini-course attached.
  useMiniCourseTranslations(project, miniCourse)

  // Mini-course state. Trigger gating reads `classificationCount` plus the
  // user's per-mini-course preferences (opt_out / slide_to_start /
  // completed_at, all keyed by `id_<minicourse.id>` matching PFE).
  const classificationCount = useSelector(
    (state) => state.classification?.classificationCount ?? 0
  )
  const isGuestUser = useSelector((state) => state?.user?.isGuestUser)
  const miniCoursePrefs = useSelector(
    (state) => state.user?.projects?.[project?.id]?.minicourses
  )
  const [isMiniCourseVisible, setIsMiniCourseVisible] = useState(false)

  // The chain's current task lives in the `classification` slice. The
  // navigator dispatches `reset()` before mount, so on the first render the
  // slice value is null; fall back to `first_task` so the shell renders the
  // correct task immediately. The effect below seeds the slice so future
  // `advanceTo`/`goBack` actions take over.
  const sliceCurrentTaskKey = useSelector(
    (state) => state.classification?.currentTaskKey
  )
  const currentTaskKey = sliceCurrentTaskKey || workflow.first_task
  const currentTask = workflow.tasks?.[currentTaskKey]

  useEffect(() => {
    if (workflow?.first_task) {
      dispatch(startChain({ taskKey: workflow.first_task }))
    }
  }, [dispatch, workflow?.id, workflow?.first_task])

  const [isHelpVisible, setIsHelpVisible] = useState(false)
  const [isFieldGuideVisible, setIsFieldGuideVisible] = useState(false)
  const [isQuestionVisible, setIsQuestionVisible] = useState(true)
  const [fullScreenMedia, setFullScreenMedia] = useState({
    visible: false,
    source: '',
    question: '',
  })

  const openFullScreenMedia = useCallback((source, question = '') => {
    setFullScreenMedia({ visible: true, source, question })
  }, [])
  const closeFullScreenMedia = useCallback(() => {
    setFullScreenMedia({ visible: false, source: '', question: '' })
  }, [])

  const hasFieldGuideItems = (guide?.items?.length ?? 0) > 0
  const hasTutorial = Boolean(tutorial?.steps?.length)
  const framingBg = colorModes.framingBackgroundColorFor(project.in_museum_mode)
  const contentBg = colorModes.contentBackgroundColorFor(project.in_museum_mode)

  useEffect(() => {
    if (currentSubject?.id) {
      // Legacy `saveClassification` reads `classifier.subjectStartTime[workflow.id]`
      // to populate the `started_at` metadata field on the submitted POST.
      dispatch(setSubjectStartTimeForWorkflow(workflow.id))
      // Kept in parallel on the new slice so Phase 2 code can migrate onto
      // it without needing to re-introduce the tracking.
      dispatch(setSubjectStartTime(new Date().toISOString()))
    }
  }, [currentSubject?.id])

  const finishTutorial = () => {
    if (needsTutorial) {
      dispatch(setTutorialCompleted(workflow.id, project.id))
    } else {
      setIsQuestionVisible(true)
    }
  }

  // Compute the current step index for the active mini-course (matches
  // PFE: read `slide_to_start.id_<id>`; default to 0 for first appearance).
  const miniCourseStepIndex = miniCourse?.id
    ? miniCoursePrefs?.slide_to_start?.[`id_${miniCourse.id}`] ?? 0
    : 0
  const miniCourseOptedOut = miniCourse?.id
    ? Boolean(miniCoursePrefs?.opt_out?.[`id_${miniCourse.id}`])
    : false
  const miniCourseCompletedAt = miniCourse?.id
    ? miniCoursePrefs?.completed_at?.[`id_${miniCourse.id}`]
    : null
  const miniCourseFrequency =
    miniCourse?.configuration?.minicourse_frequency

  // Trigger the modal after each new classification submit. Mirrors PFE's
  // `maybeLaunchMiniCourse` gate. We watch `classificationCount` rather
  // than the body's onAdvance so the trigger is decoupled from any
  // particular workflow type.
  useEffect(() => {
    if (classificationCount === 0) return
    if (isGuestUser) return
    if (needsTutorial) return
    if (!miniCourse?.steps?.length) return
    if (miniCourseOptedOut) return
    if (miniCourseCompletedAt) return
    if (!shouldShowMiniCourse(classificationCount, miniCourseFrequency)) return
    setIsMiniCourseVisible(true)
    // We intentionally only re-evaluate when the count changes; the rest
    // are reads against the latest state at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classificationCount])

  // Modal close = the user has seen this step. Match PFE's unmount
  // behavior: if at last step, mark complete; else advance step pointer.
  //
  // The step-advance dispatch is deferred to `handleMiniCourseHidden` (fires
  // after `react-native-modal`'s slide-out animation completes). Dispatching
  // immediately on close causes a visible flash of the next step's content
  // during the animation, because the component re-renders mid-slide-out.
  const handleMiniCourseClose = useCallback(() => {
    setIsMiniCourseVisible(false)
  }, [])

  const handleMiniCourseHidden = useCallback(() => {
    if (!miniCourse?.id) return
    const lastIndex = (miniCourse.steps?.length ?? 0) - 1
    if (miniCourseStepIndex >= lastIndex) {
      dispatch(setMiniCourseCompleted(project.id, miniCourse.id))
    } else {
      dispatch(
        setMiniCourseStepProgress(
          project.id,
          miniCourse.id,
          miniCourseStepIndex + 1
        )
      )
    }
  }, [dispatch, miniCourse, miniCourseStepIndex, project.id])

  // Opt-out checkbox saves immediately (matches PFE — not on close).
  const handleMiniCourseOptOutChange = useCallback(
    (value) => {
      if (!miniCourse?.id) return
      dispatch(setMiniCourseOptOut(project.id, miniCourse.id, value))
    },
    [dispatch, miniCourse, project.id]
  )

  // Restart: clear all three prefs, then re-open the modal at step 0.
  // We `await` the API write so the modal opens against fresh state.
  const handleMiniCourseRestart = useCallback(async () => {
    if (!miniCourse?.id) return
    await dispatch(restartMiniCourse(project.id, miniCourse.id))
    setIsMiniCourseVisible(true)
  }, [dispatch, miniCourse, project.id])

  // Translated step content; falls back to the raw `content` from the
  // mini-course resource if no translation is loaded for the active
  // language.
  const miniCourseStepContent = miniCourse?.steps?.[miniCourseStepIndex]
    ? t(
        `steps.${miniCourseStepIndex}.content`,
        miniCourse.steps[miniCourseStepIndex].content,
        { ns: 'miniCourse', lng: getCurrentProjectLanguage() }
      )
    : ''

  const showRestartButton =
    !isGuestUser && Boolean(miniCourse?.steps?.length)

  // Match legacy: while the initial subject or workflow resources are still
  // loading, render only the spinner. No tabs, buttons, or modals yet.
  const waitingForSubject = !currentSubject
  if (waitingForSubject || resourcesLoading) {
    return (
      <View style={[styles.container, styles.dropShadow, framingBg]}>
        <ClassifierHeader project={project} />
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
          <FontedText style={styles.loadingText}>
            {t('Mobile.classifier.loadingWorkflow', 'Loading Workflow...')}
          </FontedText>
        </View>
      </View>
    )
  }

  const tutorialContent = hasTutorial ? (
    <View style={[styles.tutorialContainer, contentBg]}>
      <Tutorial
        tutorial={tutorial}
        projectName={project.display_name}
        finishTutorial={finishTutorial}
        isInitialTutorial={needsTutorial}
        inMuseumMode={project.in_museum_mode}
      />
    </View>
  ) : null

  // Drawing workflows render their own task instruction inside
  // `DrawingHeader` (matches legacy `DrawingClassifier` layout), so the
  // shell skips rendering it in the TaskPanel.
  const isDrawingWorkflow = currentTask?.type === WorkflowTypes.Drawing

  const questionContent = !isDrawingWorkflow && (
    <View style={styles.questionContainer}>
      {currentTask && (
        <TaskQuestion
          task={currentTask}
          taskKey={currentTaskKey}
          inMuseumMode={project.in_museum_mode}
          onPressImage={openFullScreenMedia}
        />
      )}
      {currentTask?.question && markdownContainsImage(currentTask.question) && (
        <Separator style={styles.questionSeparator} />
      )}
    </View>
  )

  // Dispatch to the workflow-type body. Each body owns the subject, answer
  // interaction, and submit affordance for its task type. Unimplemented
  // types fall back to SingleChoice as a safe default until their bodies
  // are built.
  const renderBody = () => {
    const bodyProps = {
      subject: currentSubject,
      task: currentTask,
      taskKey: currentTaskKey,
      workflow,
      project,
      onAdvance: advanceToNextSubject,
      onExpandMedia: openFullScreenMedia,
    }
    // Re-mount the body whenever the active task changes so each task's
    // local selection state starts from a clean slate. Prior selections (on
    // Back navigation) are seeded from the `classification` slice in the
    // body's lazy useState initializer.
    const key = `${workflow.id}:${currentTaskKey}`
    // Body type resolution:
    //   - First task: defer to `workflow.type` so single-task auto-typing
    //     to "swipe" (2-answer single-choice) is preserved.
    //   - Subsequent chain tasks: use the task's own `type` since the
    //     workflow-level inference only describes the first task.
    const bodyType =
      currentTaskKey === workflow.first_task ? workflow.type : currentTask?.type
    switch (bodyType) {
      case WorkflowTypes.Swipe:
        return (
          <Swipe
            key={key}
            {...bodyProps}
            queue={queue}
            currentIndex={currentIndex}
            nextSubject={nextSubject}
            hasSubjects={hasSubjects}
            fetchMoreSubjects={fetchMoreSubjects}
          />
        )
      case WorkflowTypes.MultiSelect:
        return <MultiSelect key={key} {...bodyProps} />
      case WorkflowTypes.Drawing:
        return <Drawing key={key} {...bodyProps} />
      case WorkflowTypes.SingleChoice:
      default:
        return <SingleChoice key={key} {...bodyProps} />
    }
  }

  const classificationArea = (
    <View style={styles.classificationPanel}>
      <TaskPanel
        isQuestionVisible={isQuestionVisible}
        setQuestionVisibility={setIsQuestionVisible}
        hasTutorial={hasTutorial}
      >
        {isQuestionVisible && questionContent}
      </TaskPanel>
      {isQuestionVisible ? (
        <>
          {renderBody()}
          {currentTask?.help && (
            <View style={styles.needHelpContainer}>
              <NeedHelpButton
                onPress={() => setIsHelpVisible(true)}
                inMuseumMode={project.in_museum_mode}
              />
            </View>
          )}
          {hasFieldGuideItems && (
            <View style={styles.fieldGuideBtnContainer}>
              <FieldGuideBtn onPress={() => setIsFieldGuideVisible(true)} />
            </View>
          )}
          {showRestartButton && (
            <MiniCourseRestartButton onPress={handleMiniCourseRestart} />
          )}
        </>
      ) : (
        tutorialContent
      )}
    </View>
  )

  return (
    <View style={[styles.container, styles.dropShadow, framingBg]}>
      <ClassifierHeader project={project} />
      {translationsLoading && <TranslationsLoadingIndicator />}
      {needsTutorial ? tutorialContent : classificationArea}
      <HelpModal
        isVisible={isHelpVisible}
        task={currentTask}
        taskKey={currentTaskKey}
        onClose={() => setIsHelpVisible(false)}
        inMuseumMode={project.in_museum_mode}
      />
      {isFieldGuideVisible && (
        <FieldGuidePanel
          guide={guide}
          inMuseumMode={project.in_museum_mode}
          isVisible={isFieldGuideVisible}
          onClose={() => setIsFieldGuideVisible(false)}
        />
      )}
      <FullScreenMedia
        source={{ uri: fullScreenMedia.source }}
        isVisible={fullScreenMedia.visible}
        handlePress={closeFullScreenMedia}
        question={fullScreenMedia.question}
      />
      {miniCourse?.steps?.length > 0 && (
        <MiniCourse
          isVisible={isMiniCourseVisible}
          miniCourse={miniCourse}
          stepIndex={miniCourseStepIndex}
          translatedContent={miniCourseStepContent}
          onClose={handleMiniCourseClose}
          onHidden={handleMiniCourseHidden}
          onOptOutChange={handleMiniCourseOptOutChange}
          inMuseumMode={project.in_museum_mode}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tutorialContainer: {
    flex: 1,
  },
  dropShadow: {
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#005D69',
    fontSize: 14,
  },
  classificationPanel: {
    flex: 1,
    overflow: 'visible',
    backgroundColor: '#EBEBEB',
  },
  questionContainer: {
    backgroundColor: '#EBEBEB',
    paddingVertical: 16,
  },
  questionSeparator: {
    marginTop: 25,
  },
  needHelpContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  fieldGuideBtnContainer: {
    alignItems: 'center',
  },
})

export default ClassifierScreen
