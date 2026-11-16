import * as ActionConstants from '../constants/actions';
import * as R from 'ramda'

const InitialClassifier = {
    workflow: {},
    tasks: {},
    tutorial: {},
    project: {},
    needsTutorial: {},
    guide: {},
    isFetching: false,
    isSuccess: false,
    isFailure: false,
    subjectStartTime: {},
    annotations: {},
    nextSubject: {},
    inPreviewMode: false,
    subjectDimensions: {},
    subject: null,
};

export default function classifier(state=InitialClassifier, action) {
    switch (action.type) {
        case ActionConstants.ADD_CLASSIFIER_TUTORIAL: {
            const workflowIdLens = R.lensProp(action.workflowId)
            return { ...state, tutorial: R.set(workflowIdLens, action.tutorial, state.tutorial) }
        }
        case ActionConstants.ADD_WORKFLOW_NEEDS_TUTORIAL: {
            const workflowIdLens = R.lensProp(action.workflowId)
            return { ...state, needsTutorial: R.set(workflowIdLens, action.needsTutorial, state.needsTutorial) }
        }
        case ActionConstants.SET_CLASSIFIER_GUIDE: {
            const workflowIdLens = R.lensProp(action.workflowId)
            return { ...state, guide: R.set(workflowIdLens, action.guide, state.guide) }
        }
        case ActionConstants.ADD_ANNOTATION_TO_TASK: {
            const taskLens = R.lensPath([action.workflowId, action.task])
            if (action.asList) {
                const annotationList = R.view(taskLens, state.annotations) || []
                annotationList.push(action.annotation)
                return { ...state, annotations: R.set(taskLens, annotationList, state.annotations) }
            }
            return { ...state, annotations: R.set(taskLens, action.annotation, state.annotations) } 
        }
        case ActionConstants.REMOVE_ANNOTATION_FROM_TASK: {
            const taskLens = R.lensPath([action.workflowId, action.task])
            const annotationList = R.view(taskLens, state.annotations) || []
            const removedAnnotationList = R.reject(R.equals(action.annotation), annotationList)
            return { ...state, annotations: R.set(taskLens, removedAnnotationList, state.annotations) }
        }
        case ActionConstants.SET_SUBJECT_START_TIME: {
            const startTime = (new Date).toISOString()
            const workflowIdLens = R.lensProp(action.workflowId)
            return { ...state, subjectStartTime: R.set(workflowIdLens, startTime, state.subjectStartTime) }
        }
        case ActionConstants.SET_SUBJECT_DIMENSIONS: {
            const subjectIdLens = R.lensProp(action.subjectId)
            return { ...state, subjectDimensions: R.set(subjectIdLens, action.subjectDimensions, state.subjectDimensions)}
        }
        case ActionConstants.CLEAR_CLASSIFIER_DATA: {
            return { ...state, subject: null, isFetching: false, isSuccess: false, isFailure: false }
        }
        case ActionConstants.SET_CLASSIFIER_TEST_MODE: {
            return { ...state, inPreviewMode: action.isTestMode}
        }
        default:
            return state;
    }
}
