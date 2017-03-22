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
import { MOBILE_PROJECTS, SWIPE_WORKFLOWS } from '../constants/mobile_projects'
import { GLOBALS } from '../constants/globals'
import { Alert, Platform, PushNotificationIOS, NativeModules } from 'react-native'
import { addIndex, filter, find, forEach, head, intersection, keys, map, propEq } from 'ramda'

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

export function setProjectList(projectList) {
  return { type: SET_PROJECT_LIST, projectList }
}

export function syncStore(name) {
  return (dispatch, getState) => {
    const contents = getState()[name]
    return store.save(`@zooniverse:${name}`, {
        contents
    })
  }
}

export function setFromStore(name) {
  return dispatch => {
    return new Promise ((resolve) => {
      store.get(`@zooniverse:${name}`).then(json => {
        dispatch(setState(name, json['contents']))
        return resolve()
      }).catch(() => { //default to redux store defaults
        dispatch(syncStore(name))
        return resolve()
      })
    })
  }
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

export function syncProjectStore() {
  return (dispatch, getState) => {
    const projectList = getState().projectList
    return store.save('@zooniverse:projects', {
      projectList
    })
  }
}

export function setProjectListFromStore() {
  return dispatch => {
    return new Promise ((resolve, reject) => {
      store.get('@zooniverse:projects').then(json => {
        dispatch(setProjectList(json.projects))
        return resolve()
      }).catch(() => {
        return reject()
      })
    })
  }
}

export function checkIsConnected() {
  return (dispatch, getState) => {
    return new Promise((resolve, reject) => {
      if (getState().isConnected) {
        return resolve()
      } else {
        return reject('Sorry, but you must be connected to the internet to use Zooniverse')
      }
    })
  }
}

export function fetchProjects() {
  return dispatch => {
    dispatch(setProjectListFromStore())
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
      dispatch(fetchWorkflowsForMobile(projects))
      dispatch(setState(`projectList.${tag}`, projects))
      dispatch(syncProjectStore())
    }).catch((error) => {
      dispatch(displayError('The following error occurred.  Please close down Zooniverse and try again.  If it persists please notify us.  \n\n' + error,))
    })
  }
}

export function fetchWorkflowsForMobile(projects) {
  return (dispatch) => {
    return new Promise((resolve) => {
      const swipeProjects = filter((proj) => { return find(propEq('projectID', proj.id), SWIPE_WORKFLOWS) }, projects)
      const getWorkflows = (project) => {dispatch(fetchProjectWorkflows(project))}
      forEach(getWorkflows, swipeProjects)
      return resolve()
    })
  }
}

export function fetchProjectWorkflows(project) {
  return dispatch => {
    return new Promise((resolve) => {
      apiClient.type('projects').get({id: project.id}).then((projects) => {
        const project = head(projects)
        project.get('workflows', {page_size: 100, active: true, fields: 'display_name'}).then((workflows) => {
          dispatch(setState(`projectWorkflows.${project.id}`, workflows))
          return resolve()
        }).catch((error) => {
          dispatch(setError('The following error occurred.  Please close down Zooniverse and try again.  If it persists please notify us.  \n\n' + error,))
          return resolve()
        })
      })
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

export function loadSettings() {
  return (dispatch) => {
    return new Promise((resolve) => {
      dispatch(setFromStore('settings')).then(() => {
        return resolve()
      })
    })
  }
}

export function updateSetting(key, value) {
  return (dispatch) => {
    return new Promise((resolve) => {
      dispatch(setState(`settings.${key}`, value))
      dispatch(syncStore('settings'))
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
