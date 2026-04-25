import React, { useCallback, useEffect, useState } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useDispatch } from 'react-redux'
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
import Separator from '../common/Separator'
import FullScreenMedia from '../FullScreenMedia'
import * as colorModes from '../../displayOptions/colorModes'
import { markdownContainsImage } from '../../utils/markdownUtils'
import useSubjectQueue from '../../hooks/useSubjectQueue'
import useWorkflowResources from '../../hooks/useWorkflowResources'
import useProjectTranslations from '../../hooks/useProjectTranslations'
import { setTutorialCompleted, setSubjectStartTimeForWorkflow } from '../../actions/classifier'
import { setSubjectStartTime } from '../../reducers/classifierSlice'
import WorkflowTypes from '../../constants/WorkflowTypes'
import TranslationsLoadingIndicator from '../common/TranslationsLoadingIndicator'

import SingleChoice from './workflowTypes/SingleChoice'
import MultiSelect from './workflowTypes/MultiSelect'
import Drawing from './workflowTypes/Drawing'
import Swipe from './workflowTypes/Swipe'

const ClassifierScreen = ({ route }) => {
  const { project, workflow } = route.params
  const dispatch = useDispatch()
  const { t } = useTranslation()

  // Swipe workflows manage their own subject queue inside the body (via
  // `useSubjectQueue`), so the shell skips its own subject fetch to
  // avoid a duplicate API call.
  const isSwipeWorkflow = workflow.type === WorkflowTypes.Swipe

  const {
    currentSubject,
    isLoading: subjectsLoading,
    advanceToNextSubject,
    fetchMoreSubjects,
  } = useSubjectQueue(isSwipeWorkflow ? null : workflow.id)

  // Kick off the initial fetch for non-Swipe workflows.
  useEffect(() => {
    if (!isSwipeWorkflow && workflow?.id && !currentSubject) {
      fetchMoreSubjects()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow?.id, isSwipeWorkflow])
  const {
    guide,
    tutorial,
    needsTutorial,
    isLoading: resourcesLoading,
  } = useWorkflowResources(workflow, project)
  const { isLoading: translationsLoading } = useProjectTranslations(
    project,
    workflow,
    guide,
    tutorial
  )

  const currentTaskKey = workflow.first_task
  const currentTask = workflow.tasks?.[currentTaskKey]

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

  // Match legacy: while the initial subject or workflow resources are still
  // loading, render only the spinner. No tabs, buttons, or modals yet.
  // Swipe workflows handle their own subject loading inside the body, so
  // the shell doesn't gate on `currentSubject` for them.
  const waitingForSubject = !isSwipeWorkflow && !currentSubject
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
  const isDrawingWorkflow = workflow.type === WorkflowTypes.Drawing

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
    switch (workflow.type) {
      case WorkflowTypes.Swipe:
        return <Swipe {...bodyProps} />
      case WorkflowTypes.MultiSelect:
        return <MultiSelect {...bodyProps} />
      case WorkflowTypes.Drawing:
        return <Drawing {...bodyProps} />
      case WorkflowTypes.SingleChoice:
      default:
        return <SingleChoice {...bodyProps} />
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
    ...StyleSheet.absoluteFillObject,
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
