//Use for user-specific data
import apiClient from 'panoptes-client/lib/api-client'
import store from 'react-native-simple-store'
import { Actions } from 'react-native-router-flux'
import { add, addIndex, filter, fromPairs, head, isNil, keys, map, reduce } from 'ramda'

import {
  fetchRecentProjects,
  loadNotificationSettings,
  loadSettings,
  setState } from '../actions/index'
import { getAuthUser } from '../actions/auth'

export function syncUserStore() {
  return (dispatch, getState) => {
    const user = getState().user
    return store.save('@zooniverse:user', {
      user
    })
  }
}

export function setUserFromStore() {
  return dispatch => {
    return new Promise ((resolve, reject) => {
      store.get('@zooniverse:user').then(json => {
        dispatch(setState('user', json.user))
        return resolve()
      }).catch(() => {
        return reject()
      })
    })
  }
}

export function loadUserData() {
  return (dispatch, getState) => {
    dispatch(setUserFromStore()).then(() => {
      if (getState().user.isGuestUser) {
        return Promise.all([
          dispatch(loadNotificationSettings()),
          dispatch(loadSettings()),
        ])
      } else {
        dispatch(getAuthUser()).then(() => {
          return Promise.all([
            dispatch(loadUserAvatar()),
            dispatch(loadUserProjects()),
            dispatch(loadNotificationSettings()),
            dispatch(loadSettings()),
          ])
        }).catch(() => {
          dispatch(setState('errorMessage', ''))
          Actions.SignIn()
        })
      }
    }).then(() => {
      dispatch(syncUserStore())
    }).catch(() => {
      Actions.Onboarding()
    })
  }
}

export function loadUserAvatar() {
  return (dispatch) => {
    return new Promise ((resolve) => {
      dispatch(getAuthUser()).then((userResource) => {
        userResource.get('avatar').then((avatar) => {
          dispatch(setState('user.avatar', head(avatar)))
        }).catch(() => {
          dispatch(setState('user.avatar', {}))
        }).then(() => {
          return resolve()
        })
      })
    })
  }
}

export function loadUserProjects() {
  return (dispatch) => {
    dispatch(setState('loadingText', 'Loading Projects...'))
    return new Promise ((resolve, reject) => {
      dispatch(getAuthUser()).then((userResourse) => {
        userResourse.get('project_preferences').then((forCount) => {
          return forCount.length > 0 ? forCount[0].getMeta().count : 0
        }).then((preferenceCount) => {
          return userResourse.get('project_preferences', {page_size: preferenceCount, sort: '-updated_at'})
        }).then((projectPreferences) => {
          const sortedPreferences = sortPreferences(projectPreferences)
          const projectIDs = map((pref) => { return pref.links.project }, sortedPreferences)
          const classifications = classificationCounts(sortedPreferences)
          const sortOrders = orderProjects(sortedPreferences)
          const completedTutorials = getCompletedTutorials(sortedPreferences)

          return apiClient.type('projects').get({ id: projectIDs, page_size: sortedPreferences.length }).catch(() => {
            return null
          }).then((projects) => {
            map((project) => {
              dispatch(setState(`user.projects.${project.id}`, {
                  name: project.display_name,
                  slug: project.slug,
                  activity_count: classifications[project.id],
                  sort_order: sortOrders[project.id],
                  tutorials_completed_at: completedTutorials[project.id] || {}
                }
              ))
            }, projects)
          }).then(() => {
            dispatch(calculateTotalClassifications())
            dispatch(fetchRecentProjects())
            dispatch(setState('loadingText', 'Loading...'))
            return resolve()
          })
        })
      }).catch((error) => {
        dispatch(setState('errorMessage', error.message))
        return reject()
      })
    })
  }
}

export function calculateTotalClassifications() {
  return (dispatch, getState) => {
    const getCounts = (key) => getState().user.projects[key]['activity_count']
    const totalClassifications = reduce(add, 0, map(getCounts, keys(getState().user.projects)))
    dispatch(setState('user.totalClassifications', totalClassifications))
  }
}

function sortPreferences(projectPreferences){
    return addIndex(map)((preference, i) => {
      preference.sort_order = i
      return preference
    }, projectPreferences)
}

function getCompletedTutorials(projectPreferences){
  const preferencesWithTutorials = filter((pref) => { return !isNil(pref.preferences.tutorials_completed_at) }, projectPreferences)
  const extractPreference = (pref) => { return [ pref.links.project, pref.preferences.tutorials_completed_at ] }
  return fromPairs(map(extractPreference, preferencesWithTutorials))
}

function classificationCounts(projectPreferences) {
  return reduce((counts, projectPreference) => {
    counts[projectPreference.links.project] = projectPreference.activity_count
    return counts;
  }, {}, projectPreferences)
}

function orderProjects(projectPreferences) {
  return reduce((orders, projectPreference) => {
    orders[projectPreference.links.project] = projectPreference.sort_order
    return orders;
  }, {}, projectPreferences)
}
