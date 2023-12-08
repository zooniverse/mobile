//Use for user-specific data
import apiClient from 'panoptes-client/lib/api-client'
import { signOut } from './auth'
import { add, addIndex, filter, fromPairs, head, isNil, keys, map, reduce } from 'ramda'

import {
  setState 
} from '../actions/index'
import { getAuthUser } from '../actions/auth'
import * as ActionConstants from '../constants/actions'
import { PushNotifications } from '../notifications/PushNotifications'

export function loadUserData() {
  return (dispatch, getState) => {
    if (getState().user.isGuestUser) {
      return
    } else {
      getAuthUser().then((userResource) => {
        // We are no longer authenticated. Sign the user out
        if (userResource === null) {
          dispatch(signOut())
          return Promise.resolve()
        }

        if (userResource?.id) {
          PushNotifications.subTopicClassifiedProjects(userResource);
        }
        
        return Promise.all([
          dispatch(loadUserAvatar()),
          dispatch(loadUserProjects()),
        ])
      })
    }
  }
}

export function loadUserAvatar() {
  return (dispatch) => {
    return new Promise ((resolve) => {
      getAuthUser().then((userResource) => {
        userResource.get('avatar').then((avatar) => {
          dispatch({
            type: ActionConstants.SET_USER_AVATAR,
            avatar: head(avatar)
          });
        }).catch(() => {
          dispatch({
            type: ActionConstants.SET_USER_AVATAR,
            avatar: {}
          })
        }).then(() => {
          return resolve()
        })
      })
    })
  }
}

export function loadUserProjects() {
  return (dispatch) => {
    dispatch(setState('loadingText', 'Loading User Data'))
    return new Promise ((resolve, reject) => {
      getAuthUser().then((userResourse) => {
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
              const projectData = {
                name: project.display_name,
                slug: project.slug,
                activity_count: classifications[project.id],
                sort_order: sortOrders[project.id],
                tutorials_completed_at: completedTutorials[project.id] || {}
              };
              dispatch(setUserProjectData(project.id, projectData));
            }, projects)
          }).then(() => {
            dispatch(calculateTotalClassifications())
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
    dispatch({
      type: ActionConstants.SET_USER_TOTAL_CLASSIFICATIONS,
      totalClassifications
    });
  }
}

export function setUserProjectData(projectId, projectData) {
  return {
    type: ActionConstants.SET_USER_PROJECT_DATA,
    projectId: projectId,
    projectData 
  };
}

export function saveTutorialAsComplete(projectId, tutorialId, completionTime) {
  return {
    type: ActionConstants.SET_TUTORIAL_COMPLETE,
    projectId,
    tutorialId,
    completionTime
  }
}

export function setIsGuestUser(isGuestUser) {
  return {
    type: ActionConstants.SET_IS_GUEST_USER,
    isGuestUser
  }
}

export function setUser(user) {
  return {
    type: ActionConstants.SET_USER,
    user
  }
}

export function setPushPrompted(value) {
  return {
    type: ActionConstants.SET_PUSH_PROMPTED,
    value
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
