export const SET_STATE = 'SET_STATE'
export const ADD_STATE = 'ADD_STATE'
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
import { Alert, Platform, PushNotificationIOS, NativeModules } from 'react-native'
import { addIndex, filter, forEach, head, intersection, keys, map, merge, prop, sortBy } from 'ramda'
import { isValidSwipeWorkflow } from '../utils/is-valid-swipe-workflow'

export function setState(stateKey, value) {
  return { type: SET_STATE, stateKey, value }
}

export function addState(stateKey, value) {
  return { type: ADD_STATE, stateKey, value }
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

export function fetchAllProjects() {
  return (dispatch, getState) => {
    dispatch(setFromStore('projectList')).then(() => {

      dispatch(setState('projectListHolding', []))
      dispatch(loadRecents())
      dispatch(fetchProjects({mobile_friendly: true}, 'projectListHolding')).then(() => {
        dispatch(setState('projectList', sortBy(prop('display_name'), getState().projectListHolding)))
        dispatch(syncStore('projectList'))
      }).catch((error) => {
        dispatch(displayError('The following error occurred.  Please close down Zooniverse and try again.  If it persists please notify us.  \n\n' + error,))
      })
    })
  }
}

export function fetchRecentProjects() {
  return (dispatch, getState) => {
    //using holding so that the state doesn't disappear for the user during fetching
    dispatch(setState('recentsListHolding', []))

    const mobileIDs = map((p) => p.id, getState().projectList)
    let activeProjects = filter((project) => { return project.activity_count > 0 }, getState().user.projects)
    dispatch(fetchProjects({id: intersection(mobileIDs, keys(activeProjects) )}, 'recentsListHolding')).then(() => {
      dispatch(setState('recentsList', sortBy(prop('display_name'), getState().recentsListHolding)))
      dispatch(syncStore('recentsList'))
    })
  }
}

export function fetchProjects(parms, stateKey) {
  return dispatch => {
    return new Promise((resolve) => {
      const allParms = merge(parms, {include: 'avatar', sort: 'display_name'})

      apiClient.type('projects').get(allParms).then((projects) => {
        return new Promise((resolve) => {
          let promises = []
          forEach((project) => {
            const promise = apiClient.type('avatars').get(project.links.avatar.id).then((avatar) => {
              project.avatar_src = avatar.src
            }).then(() => {
              return project.get('workflows', {page_size: 100, active: true})
            }).then((workflows) => {
              project.workflows = tagSwipeFriendly(workflows)
              return dispatch(addState(stateKey, project))
            }).catch(() => {
              return dispatch(addState(stateKey, project))
            })
            promises.push(promise)
          }, projects)

          Promise.all(promises).then(() => {
            return resolve()
          })
        })
      }).then(() => {
        return resolve()
      })
    })
  }
}

function tagSwipeFriendly(workflows) {
  return map((workflow) => {
    workflow.swipe_verified = !!workflow.configuration.swipe_enabled && isValidSwipeWorkflow(workflow)
    return workflow
  }, workflows)
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
      const mobileIDs = map((p) => p.id, getState().projectList)
      dispatch(setNotificationFromStore()).then(() => {
        forEach((projectID) => {
          if (getState().notifications[projectID] === undefined) {
            dispatch(setState(`notifications.${projectID}`, true))
          }
        })(mobileIDs)

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


export function loadRecents() {
  return (dispatch) => {
    return new Promise((resolve) => {
      dispatch(setFromStore('recentsList')).then(() => {
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
    getState().projectList.reduce((promise, project) => {
      return promise.then(() => {
        var subscribed = getState().notifications[project.id]
        return dispatch(updateInterestSubscription(project.id, subscribed))
      })
    }, Promise.resolve())
  }
}

export function updateInterestSubscription(interest, subscribed) {
  var NotificationSettings = NativeModules.NotificationSettings
  return () => {
    return new Promise((resolve) => {
      NotificationSettings.setInterestSubscription(interest, subscribed).then((message) => {
        return resolve(message)
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
