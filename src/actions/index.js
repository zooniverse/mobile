export const SET_STATE = 'SET_STATE'
export const ADD_STATE = 'ADD_STATE'
export const REMOVE_STATE = 'REMOVE_STATE'
export const SET_USER = 'SET_USER'
export const SET_ERROR = 'SET_ERROR'
export const SET_IS_FETCHING = 'SET_IS_FETCHING'
export const SET_IS_CONNECTED = 'SET_IS_CONNECTED'
export const SET_PROJECT_LIST = 'SET_PROJECT_LIST'

export const STORE_USER = 'STORE_USER'
export const GET_USER_STORE = 'GET_USER_STORE'
export const SIGN_IN = 'SIGN_IN'

import apiClient from 'panoptes-client/lib/api-client'
import {Alert, Platform} from 'react-native'
import PushNotificationIOS from '@react-native-community/push-notification-ios';

import {addIndex, forEach, head, keys, map} from 'ramda'

export function setState(stateKey, value) {
  return { type: SET_STATE, stateKey, value }
}

export function addState(stateKey, value) {
  return { type: ADD_STATE, stateKey, value }
}

export function removeState(stateKey, value) {
  return { type: REMOVE_STATE, stateKey, value }
}

export function setUser(user) {
  return { type: SET_USER, user }
}

export function setIsFetching(isFetching) {
  return { type: SET_IS_FETCHING, isFetching }
}

export function setError(errorMessage) {
  return { type: SET_ERROR, errorMessage }
}

export function setProjectList(projectList) {
  return { type: SET_PROJECT_LIST, projectList }
}

export function checkIsConnected() {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      if (getState().main.isConnected) {
        return resolve()
      } else {
        return reject('Sorry, but you must be connected to the internet to use Zooniverse')
      }
    })
  }
}

export function fetchNotificationProject(projectID) {
  return dispatch => {
    apiClient.type('projects').get({id: projectID}).then((projects) => {
      dispatch(setState('notificationProject', head(projects)))
    }).catch((error) => {
      dispatch(setError('The following error occurred.  Please close down Zooniverse and try again.  If it persists please notify us.  \n\n' + error,))
    })
  }
}

export function checkPushPermissions() {
  return (dispatch) => {
    return new Promise((resolve) => {
      if (Platform.OS === 'ios') {
        PushNotificationIOS.checkPermissions((permissions) => {
          dispatch(setState('pushEnabled', (permissions.alert === 0) ? false : true))
          return resolve()
        })
      } else {
        dispatch(setState('pushEnabled', true))
        return resolve()
      }
    })
  }
}

export function setIsConnected(isConnected) {
  return (dispatch) => {
    dispatch(setState('isConnected', isConnected))
    if (isConnected === false) {
      dispatch(displayError('Oh no!  It appears you\'ve gone offline.  Please reconnect to use Zooniverse.'))
    }
  }
}

export function displayError(errorMessage) {
  return () => {
    Alert.alert( 'Error', errorMessage )
  }
}
