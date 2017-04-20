import { merge, lensPath, set } from 'ramda'

export const InitialState = {
  user: {},
  registration: { global_email_communication: true },
  isFetching: false,
  errorMessage: null,
  isConnected: null,
  selectedDiscipline: null,
  projectList: {},
  projectWorkflows: {},
  webViewNavCounter: 0,
  notificationProject: {},
  notificationPayload: {},
  notifications: { general: true },
  session: {},
  settings: { promptForWorkflow: false },
  pushEnabled: false,
  pushPrompted: false,
  classifier: { //key is workflow ID for each
    isFetching: true,
    currentWorkflowID: 0,
    workflow: {},
    project: {},
    tutorial: {},
    needsTutorial: {},
    questionContainerHeight: {},
  },
}

export default function(state=InitialState, action) {
  switch (action.type) {
    case 'SET_STATE':
      return set(lensPath(action.stateKey.split('.')), action.value, state)
    case 'SET_USER':
      return merge(state, {
        user: action.user
      })
    case 'SET_IS_FETCHING':
      return merge(state, {
        isFetching: action.isFetching
      })
    case 'SET_ERROR':
      return merge(state, {
        errorMessage: action.errorMessage
      })
    case 'SET_PROJECT_LIST':
      return merge(state, {
        projectList: action.projectList
      })
    default:
      return InitialState;
  }
}
