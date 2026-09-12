import auth from 'panoptes-client/lib/auth'
import {
  checkIsConnected,
  setState,
  setIsFetching
} from '../actions/index'
import { loadUserAvatar, loadUserProjects, setIsGuestUser, setUser } from '../actions/user'
import * as ActionConstants from '../constants/actions'
import { navRef, navigateWhenReady } from '../navigation/RootNavigator';
import { StackActions } from '@react-navigation/native';
import { PushNotifications } from '../notifications/PushNotifications';

const USER_DATA_LOAD_TIMEOUT = 15000;

function waitForUserData(promise) {
  let timeout;
  const timeoutPromise = new Promise((resolve) => {
    timeout = setTimeout(resolve, USER_DATA_LOAD_TIMEOUT);
  });

  return Promise.race([
    promise.catch(() => undefined),
    timeoutPromise,
  ]).finally(() => clearTimeout(timeout));
}

export function getAuthUser() {
  //prevent red screen of death thrown by a console.error in javascript-client
  /* eslint-disable no-console */
  console.reportErrorsAsExceptions = false
  // Refresh the bearer token before resolving the user, matching the web
  // app. This renews an expired-but-refreshable session so returning users
  // keep working instead of failing silently. Falls back to checkCurrent if
  // the refresh fails, which resolves null for a truly expired session.
  return auth.checkBearerToken()
    .then(() => auth.checkCurrent())
    .catch(() => auth.checkCurrent());
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

        // Check if logged in user is a tester and log a testing push token.
        PushNotifications.logTestingToken(user);
        return waitForUserData(Promise.all([
          dispatch(loadUserAvatar()),
          dispatch(loadUserProjects()),
        ]))
      }).then(() => {
        navigation.dispatch(StackActions.popToTop());
        navRef.navigate('ZooniverseApp', {refresh: true});
      }).catch((error) => {
        dispatch(setState('errorMessage', error.message))
      }).finally(() => {
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
        navigation.dispatch(StackActions.popToTop());
        navRef.navigate('ZooniverseApp', {refresh: true});
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


export function signOut(navigation, destination = 'SignIn') {
  return dispatch => {
    auth.signOut()
    dispatch({ type: ActionConstants.SIGN_OUT });
    dispatch(setState('errorMessage', null))
    navigation?.dispatch(StackActions.popToTop());
    navigateWhenReady(destination);
  }
}

export function continueAsGuest(navigation) {
  return dispatch => {
    dispatch(setIsGuestUser(true))
    navigation.dispatch(StackActions.popToTop());
  }
}
