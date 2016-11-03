export const SET_USER = 'SET_USER'
export const SET_ERROR = 'SET_ERROR'
export const SET_IS_FETCHING = 'SET_IS_FETCHING'
export const SET_IS_CONNECTED = 'SET_IS_CONNECTED'
export const SET_PROJECT_LIST = 'SET_PROJECT_LIST'

export const STORE_USER = 'STORE_USER'
export const GET_USER_STORE = 'GET_USER_STORE'
export const SIGN_IN = 'SIGN_IN'

import auth from 'panoptes-client/lib/auth'
import apiClient from 'panoptes-client/lib/api-client'
import store from 'react-native-simple-store'
import { NetInfo } from 'react-native'
import { head } from 'ramda'
import { Actions, ActionConst } from 'react-native-router-flux'


export function setUser(user) {
  return { type: SET_USER, user }
}

export function setIsFetching(isFetching) {
  return { type: SET_IS_FETCHING, isFetching }
}

export function setError(errorMessage) {
  return { type: SET_ERROR, errorMessage }
}

export function setIsConnected(isConnected) {
  return { type: SET_IS_CONNECTED, isConnected }
}

export function setProjectList(projectList) {
  return { type: SET_PROJECT_LIST, projectList }
}

export function storeUser(user) {
  return () => {
    store.save('@zooniverse:user', {
      user
    })
  }
}

export function setUserFromStore() {
  return dispatch => {
    dispatch(setIsFetching(true))
    store.get('@zooniverse:user')
      .then(json => {
        dispatch(setUser(json.user))
        dispatch(setIsFetching(false))
      })
      .catch(() => { //nothing here, send user to login screen
        Actions.SignIn()
        dispatch(setIsFetching(false))
      });
  }
}

export function signIn(login, password) {
  return dispatch => {
    dispatch(setIsFetching(true))
    dispatch(setError(''))
    NetInfo.isConnected.fetch().then(isConnected => {
      if (isConnected) {
        auth.signIn({login: login, password: password})
          .then((user) => {
            user.get('avatar')
              .then((avatar) => {
                user.avatar = head(avatar)
              })
              .catch(() => {
                user.avatar = {}
              })
              .then(() => {
                dispatch(setUser(user))
                dispatch(storeUser(user))
                dispatch(setIsFetching(false))
                Actions.ZooniverseApp({type: ActionConst.RESET})
              })
          })
          .catch((error) => {
            dispatch(setError(error.message))
            dispatch(setIsFetching(false))
          })
      } else {
        dispatch(setError('Sorry, but you must be connected to the internet to use Zooniverse'))
        dispatch(setIsFetching(false))
      }
    })
  }
}

export function signOut() {
  return dispatch => {
    store.delete('@zooniverse:user')
    dispatch(setUser({}))
    dispatch(setError(null))
    Actions.SignIn()
  }
}

export function fetchProjects(parms) {
  return dispatch => {
    dispatch(setError(''))
    dispatch(setIsFetching(false))
    apiClient.type('projects').get(parms)
      .then((projects) => {
        dispatch(setProjectList(projects))
      })
      .catch((error) => {
        dispatch(setError('The following error occurred.  Please close down Zooniverse and try again.  If it persists please notify us.  \n\n' + error,))
      })
      .then(() => {
        dispatch(setIsFetching(false))
      })
  }
}
