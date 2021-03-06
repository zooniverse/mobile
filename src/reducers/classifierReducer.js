import * as ActionConstants from '../constants/actions';
import R from 'ramda'

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
    seenThisSession: {},
    nextSubject: {},
    questionContainerHeight: {},
    inPreviewMode: false,
    subjectLists: {},
    subjectDimensions: {},
    subject: null,
};

export default function classifier(state=InitialClassifier, action) {
    switch (action.type) {
        case ActionConstants.APPEND_SUBJECTS_TO_WORKFLOW: {
            const subjectList = state.subjectLists[action.workflowId] || []
            const workflowIdLens = R.lensProp(action.workflowId)
            const newSubjectList =  R.set(workflowIdLens, [...subjectList, ...action.subjects], state.subjectLists)
            return { ...state, subjectLists: newSubjectList}
        }
        case ActionConstants.CLEAR_SUBJECTS_FROM_WORKFLOW: {
            const workflowIdLens = R.lensProp(action.workflowId)
            return { ...state, subjectLists: R.set(workflowIdLens, [], state.subjectList) }
        }
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
        case ActionConstants.SET_SUBJECT_SEEN_THIS_SESSION: {
            const workflowIdLens = R.lensProp(action.workflowId)
            const subjectsSeenArray = state.seenThisSession[action.workflowId] || []
            subjectsSeenArray.push(action.subjectId)
            const updatedSubjects = state.subjectLists[action.workflowId].map(subject => {
                if (subject.id === action.subjectId) {
                    return R.set(R.lensProp('already_seen'), true, subject)
                } else {
                    return subject
                }
            })
            const seenThisSession = R.set(workflowIdLens, subjectsSeenArray, state.seenThisSession)
            const subjectLists = R.set(workflowIdLens, updatedSubjects, state.subjectLists)
            return { ...state, seenThisSession, subjectLists} 
        }
        case ActionConstants.SET_QUESTION_CONTAINER_HEIGHT: {
            const workflowIdLens = R.lensProp(action.workflowId)
            return { ...state, questionContainerHeight: R.set(workflowIdLens, action.questionContainerHeight, state.questionContainerHeight)}
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
        case ActionConstants.SET_SUBJECT_FOR_WORKFLOW: {
            const subjectList = state.subjectLists[action.workflowId] || []
            const subjectsSeenThisSession = state.seenThisSession[action.workflowId] || []
            const usableSubjects = subjectList.filter(subject => !subjectsSeenThisSession.includes(subject.id))
            const subject = usableSubjects[0]
            if (subject) {
                return { ...state, subject }
            } else {
                // If the user has seen every subject, display a random one they have seen
                return { ...state, subject: subjectList[Math.floor(Math.random() * subjectList.length)] }
            }
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
            return { ...state, subject: null, isFetching: false, isSuccess: false, isFailure: false }
        }
        case ActionConstants.SET_CLASSIFIER_TEST_MODE: {
            return { ...state, inPreviewMode: action.isTestMode}
        }
        default:
            return state;
    }
}