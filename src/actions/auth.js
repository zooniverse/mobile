import auth from 'panoptes-client/lib/auth'
import {
  checkIsConnected,
  setState,
  setIsFetching
} from '../actions/index'
import { loadUserAvatar, loadUserProjects, setIsGuestUser, setUser } from '../actions/user'
import * as ActionConstants from '../constants/actions'
import { navRef } from '../navigation/RootNavigator';

export function getAuthUser() {
  //prevent red screen of death thrown by a console.error in javascript-client
  /* eslint-disable no-console */
  console.reportErrorsAsExceptions = false
  return auth.checkCurrent();
}

export function signIn(login, password, navigation) {
  return dispatch => {
    dispatch(setIsFetching(true))
    dispatch(setState('loadingText', 'Signing In...'))
    dispatch(setState('errorMessage', null))
    dispatch(checkIsConnected()).then(() => {
      //Autofill adds a space to the username, so we remove that here
      auth.signIn({login: login.trim(), password: password}).then((user) => {
        user.isGuestUser = false
        user.projects = {}
        dispatch(setUser(user));
        return Promise.all([
          dispatch(loadUserAvatar()),
          dispatch(loadUserProjects()),
        ])
      }).then(() => {
        dispatch(setIsFetching(false))
        navigation.navigate('ZooniverseApp', {refresh: true});
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

export function register(navigation) {
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
        user.projects = {}
        dispatch(setUser(user))
        dispatch(setIsFetching(false))
        navigation.navigate('ZooniverseApp');
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


export function signOut(navigation) {
  return dispatch => {
    auth.signOut()
    dispatch({ type: ActionConstants.SIGN_OUT });
    dispatch(setState('errorMessage', null))
    navRef.navigate('SignIn');
  }
}

export function continueAsGuest(navigation) {
  return dispatch => {
    dispatch(setIsGuestUser(true))
    navRef.navigate('SignIn');
  }
}
