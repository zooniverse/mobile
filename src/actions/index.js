export const SET_STATE = 'SET_STATE'
export const SET_USER = 'SET_USER'
export const SET_ERROR = 'SET_ERROR'
export const SET_IS_FETCHING = 'SET_IS_FETCHING'
export const SET_IS_CONNECTED = 'SET_IS_CONNECTED'
export const SET_PROJECT_LIST = 'SET_PROJECT_LIST'

export const STORE_USER = 'STORE_USER'
export const GET_USER_STORE = 'GET_USER_STORE'
export const SIGN_IN = 'SIGN_IN'

import store from 'react-native-simple-store'
import apiClient from 'panoptes-client/lib/api-client'
import { PUBLICATIONS } from '../constants/publications'
import { MOBILE_PROJECTS } from '../constants/mobile_projects'
import { GLOBALS } from '../constants/globals'
import { Platform, PushNotificationIOS, NativeModules, NetInfo } from 'react-native'
import { addIndex, filter, forEach, head, intersection, keys, map, propEq } from 'ramda'

export function setState(stateKey, value) {
  return { type: SET_STATE, stateKey, value }
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

export function setIsConnected(isConnected) {
  return { type: SET_IS_CONNECTED, isConnected }
}

export function setProjectList(projectList) {
  return { type: SET_PROJECT_LIST, projectList }
}


export function syncNotificationStore() {
  return (dispatch, getState) => {
    const notifications = getState().notifications
    return store.save('@zooniverse:notifications', {
      notifications
    })
  }
}

export function setNotificationFromStore() {
  return dispatch => {
    return new Promise ((resolve) => {
      store.get('@zooniverse:notifications').then(json => {
        dispatch(setState('notifications', json.notifications))
        return resolve()
      }).catch(() => {
        return resolve()
      })
    })
  }
}

export function checkIsConnected() {
  return () => {
    return new Promise((resolve, reject) => {
      NetInfo.isConnected.fetch().then(isConnected => {
        if (!isConnected) {
          return reject('Sorry, but you must be connected to the internet to use Zooniverse')
        }
        return resolve()
      })
    })
  }
}

export function fetchProjects() {
  return dispatch => {
    dispatch(setError(''))
    let callFetchProjects = tag => dispatch(fetchProjectsByParms(tag.value))
    forEach(callFetchProjects, filter(propEq('display', true), GLOBALS.DISCIPLINES))
  }
}

export function fetchProjectsByParms(tag) {
  return (dispatch, getState) => {
    let parms = {id: MOBILE_PROJECTS, cards: true, sort: 'display_name'}
    if (tag === 'recent') {
      parms.id = intersection(MOBILE_PROJECTS, keys(getState().user.projects) )
    } else {
      parms.tags = tag
    }

    apiClient.type('projects').get(parms).then((projects) => {
      dispatch(setState(`projectList.${tag}`, projects))
    }).catch((error) => {
      dispatch(setError('The following error occurred.  Please close down Zooniverse and try again.  If it persists please notify us.  \n\n' + error,))
    }).then(() => {
      dispatch(setIsFetching(false))
    })
  }
}

export function fetchPublications() {
  return dispatch => {
    map((key) => {
      addIndex(forEach)(
        (project, idx) => {
          dispatch(setState(`publications.${key}.projects.${idx}.publications`, project.publications))
          dispatch(setState(`publications.${key}.projects.${idx}.slug`, project.slug))

          if (project.slug) {
            apiClient.type('projects').get({ slug: project.slug, cards: true }).then((project) => {
              dispatch(setState(`publications.${key}.projects.${idx}.display_name`, head(project).display_name))
              dispatch(setState(`publications.${key}.projects.${idx}.avatar_src`, head(project).avatar_src))
            })
          } else {
            dispatch(setState(`publications.${key}.projects.${idx}.display_name`, 'Meta Studies'))
            dispatch(setState(`publications.${key}.projects.${idx}.avatar_src`, ''))
          }

        },
        PUBLICATIONS[key]
      )
    }, keys(PUBLICATIONS))
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

export function loadNotificationSettings() {
  return (dispatch, getState) => {
    return new Promise((resolve) => {
      dispatch(setNotificationFromStore()).then(() => {
        forEach((projectID) => {
          if (getState().notifications[projectID] === undefined) {
            dispatch(setState(`notifications.${projectID}`, true))
          }
        })(MOBILE_PROJECTS)

        dispatch(checkPushPermissions()).then(()=> {
          if (getState().pushEnabled){
            dispatch(syncInterestSubscriptions())
          }
        })
        dispatch(syncNotificationStore())
      })
      return resolve()
    })
  }
}

export function syncInterestSubscriptions() {
  return (dispatch, getState) => {
    MOBILE_PROJECTS.reduce((promise, projectID) => {
      return promise.then(() => {
        var subscribed = getState().notifications[projectID]
        return dispatch(updateInterestSubscription(projectID, subscribed))
      })
    }, Promise.resolve())
  }
}

export function updateInterestSubscription(interest, subscribed) {
  var NotificationSettings = NativeModules.NotificationSettings
  return () => {
    return new Promise((resolve) => {
      NotificationSettings.setInterestSubscription(interest, subscribed).then((message) => {
        //Timeout needed or crashes ios.  Open issue: https://github.com/pusher/libPusher/issues/230
        setTimeout(()=> {
          return resolve(message)
        }, 500)
      })

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
