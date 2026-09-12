import * as R from 'ramda'

import * as classifierActions from '../actions/classifier'
import * as drawingActions from '../actions/drawing'
import { setNavbarSettingsForPage } from '../actions/navBar'
import { reset } from '../reducers/classifierSlice'
import PageKeys from '../constants/PageKeys'
import theme from '../theme'
import { clearProjectTranslations } from '../i18n'

const navigateToClassifier = R.curry((dispatch, inPreviewMode, inBetaMode, project, navigation, workflow) => {
    dispatch(setNavbarSettingsForPage({
        isPreview: inPreviewMode, //TODO: Decouple preview mode from the color of the safe area container
        title: project.in_museum_mode ? 'ZOONIVERSE - DO REAL RESEARCH!' : project.display_name,
        showBack: !project.in_museum_mode,
        hamburgerMenuShowing: !project.in_museum_mode,
        centerType: 'title',
        backgroundColor: inPreviewMode ? 'rgba(228,89,80,1)' : theme.$zooniverseTeal
    }, PageKeys.ClassifierScreen))

    dispatch(reset())
    dispatch(classifierActions.clearClassifierData())
    dispatch(drawingActions.clearShapes())
    clearProjectTranslations()

    navigation.navigate("ClassifierScreen", {
      project,
      workflow,
      display_name: project.display_name,
      inPreviewMode,
      inBetaMode,
    })
})

function getPageKeyForWorkflowType(workflowType) {
    switch (workflowType) {
        case 'drawing':
            return PageKeys.DrawingClassifier;
        case 'single':
            return PageKeys.QuestionClassifier;
        case 'swipe':
            return PageKeys.SwipeClassifier;
        case 'multiple':
            return PageKeys.MultiAnswerClassifier;
    }
}

function navigateToSwipeClassifier(inPreviewMode, inBetaMode, project, workflow, dispatch, navigation) {
    dispatch(classifierActions.clearClassifierData())
    // Use startSwiperClassification instead of startNewClassification —
    // the Swiper manages its own subject queue via useSubjectQueue hook,
    // so we skip the Redux subject fetch to avoid a duplicate API call.
    dispatch(classifierActions.startSwiperClassification(workflow, project))
    clearProjectTranslations() // Clear old translations before navigating
    navigation.navigate("SwipeClassifier", {
      project,
      workflow,
      display_name: project.display_name,
      inPreviewMode,
      inBetaMode,
    });
}

function navigateToQuestionClassifier(inPreviewMode, inBetaMode, project, workflow, dispatch, navigation) {
    dispatch(classifierActions.clearClassifierData())
    dispatch(classifierActions.startNewClassification(workflow, project))
    clearProjectTranslations() // Clear old translations before navigating
    navigation.navigate("QuestionClassifier", {
      project,
      workflow,
      display_name: project.display_name,
      inPreviewMode,
      inBetaMode,
    });
}

function navigateToMultiAnswerClassifier(inPreviewMode, inBetaMode, project, workflow, dispatch, navigation) {
    dispatch(classifierActions.clearClassifierData())
    dispatch(classifierActions.startNewClassification(workflow, project))
    clearProjectTranslations() // Clear old translations before navigating
    navigation.navigate("MultiAnswerClassifier", {
      project,
      workflow,
      display_name: project.display_name,
      inPreviewMode,
      inBetaMode,
    });
}

function navigateToDrawingClassifier(inPreviewMode, inBetaMode, project, workflow, dispatch, navigation) {
    dispatch(classifierActions.clearClassifierData())
    dispatch(drawingActions.clearShapes())
    dispatch(classifierActions.startNewClassification(workflow, project))
    clearProjectTranslations() // Clear old translations before navigating
    navigation.navigate("DrawingClassifier", {
      ...parseDrawingTask(workflow),
      project,
      workflow,
      display_name: project.display_name,
      inPreviewMode,
      inBetaMode,
    });
}

/**
 * Parses out all of the task information from the workflow and forms it into an object
 * @param {workflow to be parsed} workflow
 * @returns {
 *
 * }
 */
function parseDrawingTask(workflow) {
    const helpLens = R.lensPath(['tasks', 'T0', 'help'])
    const toolsLens = R.lensPath(['tasks', 'T0', 'tools'])
    const instructionLens = R.lensPath(['tasks', 'T0', 'instruction'])
    return {
        help: R.view(helpLens, workflow),
        tools: R.view(toolsLens, workflow),
        instructions: R.view(instructionLens, workflow)
    }
}

export default navigateToClassifier
