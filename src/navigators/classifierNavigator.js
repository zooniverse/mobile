import {Actions} from 'react-native-router-flux'
import * as classifierActions from '../actions/classifier'
import * as drawingActions from '../actions/drawing'
import R from 'ramda'

const navigateToClassifier = R.curry((dispatch, inPreviewMode, inBetaMode, project, workflow) => {
    switch (workflow.type) {
        case 'drawing':
            navigateToDrawingClassifier(inPreviewMode, inBetaMode, project, workflow, dispatch);
            break;
        case 'question':
            navigateToSwipeClassifier(inPreviewMode, inBetaMode, project, workflow, dispatch);
            break;
    }
})

function navigateToSwipeClassifier(inPreviewMode, inBetaMode, project, workflow, dispatch) {
    dispatch(classifierActions.clearClassifierData())
    dispatch(classifierActions.startNewClassification(workflow, project))
        Actions.SwipeClassifier({ 
            project,
            workflow,
            display_name: project.display_name,
            inPreviewMode,
            inBetaMode
        })
}

function navigateToDrawingClassifier(inPreviewMode, inBetaMode, project, workflow, dispatch) {
    dispatch(classifierActions.clearClassifierData())
    dispatch(drawingActions.clearShapes())
    dispatch(classifierActions.startNewClassification(workflow, project))
    Actions.DrawingClassifier({
        ...parseDrawingTask(workflow),
        project,
        workflow,
        display_name: project.display_name,
        inPreviewMode,
        inBetaMode
    })
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