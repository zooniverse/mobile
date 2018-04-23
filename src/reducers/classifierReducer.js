import * as ActionConstants from '../constants/actions';
import R from 'ramda'

const InitialClassifier = {
    currentWorkflowId: 0,
    workflow: {},
    tasks: {},
    tutorial: {},
    project: {},
    needsTutorial: {},
    classification: {},
    guide: {},
    isFetching: false,
    isSuccess: false,
    isFailure: false,
    annotations: {},
    upcomingSubjects: {},
    seenThisSession: {},
    subject: {},
    nextSubject: {},
    questionContainerHeight: {},
    inPreviewMode: false
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
        case ActionConstants.SET_CLASSIFICATION: {
            const workflowIdLens = R.lensProp(action.workflowId)
            return { ...state, classification: R.set(workflowIdLens, action.classification, state.classification) }
        }
        case ActionConstants.INITIALIZE_ANNOTATION: {
            const workflowIdLens = R.lensProp(action.workflowId)
            return { ...state, annotations: R.set(workflowIdLens, {}, state.annotations)} 
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
        case ActionConstants.SET_UPCOMING_SUBJECTS: {
            const workflowIdLens = R.lensProp(action.workflowId)
            return { ...state, upcomingSubjects: R.set(workflowIdLens, action.upcomingSubjects, state.upcomingSubjects)} 
        }
        case ActionConstants.SET_SUBJECT_SEEN_THIS_SESSION: {
            const workflowIdLens = R.lensProp(action.workflowId)
            const subjectsSeenArray = state.seenThisSession[action.workflowId] || []
            subjectsSeenArray.push(action.subjectId)
            return { ...state, seenThisSession: R.set(workflowIdLens, subjectsSeenArray, state.seenThisSession)} 
        }
        case ActionConstants.SET_SUBJECT: {
            const workflowIdLens = R.lensProp(action.workflowId)
            return { ...state, subject: R.set(workflowIdLens, action.subject, state.subject)}
        }
        case ActionConstants.SET_NEXT_SUBJECT: {
            const workflowIdLens = R.lensProp(action.workflowId)
            return { ...state, nextSubject: R.set(workflowIdLens, action.nextSubject, state.nextSubject)}
        }
        case ActionConstants.SET_QUESTION_CONTAINER_HEIGHT: {
            const workflowIdLens = R.lensProp(action.workflowId)
            return { ...state, questionContainerHeight: R.set(workflowIdLens, action.questionContainerHeight, state.questionContainerHeight)}
        }
        case ActionConstants.REQUEST_CLASSIFIER_DATA: {
            return { ...state, isFetching: true }
        }
        case ActionConstants.CLASSIFIER_DATA_SUCCESS: {
            return { ...state, isFetching: false, isSuccess: true }
        }
        case ActionConstants.CLASSIFIER_DATA_FAILURE: {
            return { ...state, isFetching: false, isFailure: true }
        }
        case ActionConstants.CLEAR_CLASSIFIER_DATA: {
            return { ...state, isFetching: false, isSuccess: false, isFailure: false }
        }
        case ActionConstants.SET_CLASSIFIER_TEST_MODE: {
            return { ...state, inPreviewMode: action.isTestMode}
        }
        default:
            return state;
    }
}