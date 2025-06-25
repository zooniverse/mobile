import { append, equals, lensPath, merge, reject, set, view } from 'ramda';
import { combineReducers } from 'redux';
import app from './appReducer'
import user from './userReducer';
import projects from './projectsReducer';
import navBar from './navBarReducer';
import classifier from './classifierReducer'
import images from './imagesReducer'
import settings from './settingsReducer'
import drawing from './drawingReducer'
import notifications from './notificationsSlice'
import notificationSettings from './notificationSettingsSlice'
import languageSettings from './languageSettingsSlice'

export const InitialState = {
  registration: { global_email_communication: true },
  isFetching: false,
  errorMessage: null,
  isConnected: null,
  selectedDiscipline: null,
  webViewNavCounter: 0,
  notificationProject: {},
  notificationPayload: {},
  notifications: { general: true },
  session: {},
  settings: { promptForWorkflow: false },
  pushEnabled: false,
  pushPrompted: false,
}

 function main(state=InitialState, action) {
  switch (action.type) {
    case 'SET_STATE':
      return set(lensPath(action.stateKey.split('.')), action.value, state)
    case 'ADD_STATE':
      return set(lensPath(action.stateKey.split('.')),
        append(
          action.value, view(lensPath(action.stateKey.split('.')),
          state)
        ), state)
    case 'REMOVE_STATE':
      return set(lensPath(action.stateKey.split('.')),
        reject(
          equals(action.value), view(lensPath(action.stateKey.split('.')),
          state)
        ), state)

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
      return state;
  }
}

export default combineReducers({
  main,
  app,
  user,
  projects,
  navBar,
  classifier,
  images,
  settings,
  drawing,
  notifications,
  notificationSettings,
  languageSettings
})
