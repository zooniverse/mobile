import auth from 'panoptes-client/lib/auth'
import { Actions, ActionConst } from 'react-native-router-flux'
import {
  checkIsConnected,
  loadNotificationSettings,
  loadSettings,
  setState,
  setIsFetching
} from '../actions/index'
import { loadUserAvatar, loadUserProjects, syncUserStore, setIsGuestUser, setUser } from '../actions/user'
import * as ActionConstants from '../constants/actions'

export function getAuthUser() {
  //prevent red screen of death thrown by a console.error in javascript-client
  /* eslint-disable no-console */
  console.reportErrorsAsExceptions = false
  return auth.checkCurrent();
}

export function signIn(login, password) {
  return dispatch => {
    dispatch(setIsFetching(true))
    dispatch(setState('loadingText', 'Signing In...'))
    dispatch(setState('errorMessage', null))
    dispatch(checkIsConnected()).then(() => {
      auth.signIn({login: login, password: password}).then((user) => {
        user.isGuestUser = false
        dispatch(setUser(user));
        return Promise.all([
          dispatch(loadUserAvatar()),
          dispatch(loadUserProjects()),
          dispatch(loadNotificationSettings()),
          dispatch(loadSettings()),
        ])
      }).then(() => {
        dispatch(syncUserStore())
        dispatch(setIsFetching(false))
        Actions.ZooniverseApp({type: ActionConst.RESET})  // Go to home screen
      }).catch((error) => {
        dispatch(setState('errorMessage', error.message))
        dispatch(setIsFetching(false))
      })
    }).catch((error) => {
      dispatch(setState('errorMessage', error))
      dispatch(setIsFetching(false))
    })
  }
}

export function register() {
  return (dispatch, getState) => {
    dispatch(setIsFetching(true))
    dispatch(setState('errorMessage', ''))
    const values={
      login: getState().main.registration.login,
      password: getState().main.registration.password,
      email: getState().main.registration.email,
      credited_name: getState().main.registration.credited_name,
      global_email_communication: getState().main.registration.global_email_communication,
    }
    dispatch(checkIsConnected()).then(() => {
      auth.register(values).then((user) => {
        user.avatar = {}
        user.isGuestUser = false
        dispatch(setUser(user))
        dispatch(syncUserStore())
        dispatch(setIsFetching(false))
        Actions.ZooniverseApp({type: ActionConst.RESET})
      }).catch((error) => {
        dispatch(setState('errorMessage', error.message))
        dispatch(setIsFetching(false))
      })
    }).catch((error) => {
      dispatch(setState('errorMessage', error))
      dispatch(setIsFetching(false))
    })
  }
}


export function signOut() {
  return dispatch => {
    dispatch({ type: ActionConstants.SIGN_OUT });
    dispatch(setState('errorMessage', null))
    Actions.SignIn()
  }
}

export function continueAsGuest() {
  return dispatch => {
    dispatch(loadNotificationSettings()).then(() => {
      dispatch(loadSettings()),
      dispatch(setIsGuestUser(true))
      dispatch(syncUserStore())
    })
    Actions.ZooniverseApp({type: ActionConst.RESET})
  }
}
