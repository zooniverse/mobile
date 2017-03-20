import apiClient from 'panoptes-client/lib/api-client'
import { forEach, isEmpty, isNil } from 'ramda'
import { setState } from '../actions/index'
import { getAuthUser } from '../actions/auth'
import { Actions } from 'react-native-router-flux'
import { Alert } from 'react-native'

export function startNewClassification(workflowID) {
  return (dispatch, getState) => {
    dispatch(setState('classifier.isFetching', true))
    dispatch(setState('loadingText', 'Loading Workflow...'))
    dispatch(setState('classifier.currentWorkflowID', workflowID))
    dispatch(fetchWorkflow(workflowID)).then(() => {
      if (getState().classifier.tutorial[workflowID] !== undefined) {
        return
      }
      return dispatch(fetchTutorials(workflowID))
    }).then(() => {
      if (getState().classifier.project[workflowID] !== undefined) {
        return
      }
      return dispatch(fetchProject(workflowID))
    }).then(() => {
      return dispatch(setupProjectPreferences(workflowID))
    }).then(() => {
      return dispatch(setNeedsTutorial())
    }).then(() => {
      dispatch(setState('classifier.isFetching', false))
    }).catch(() => {
      Alert.alert('Error', 'Sorry, but there was an error loading this workflow.  Please try again later.',
        [{text: 'Go Back', onPress: () => { Actions.pop()}}]
      )
    })
  }
}

export function fetchWorkflow(workflowID) {
  return (dispatch, getState) => {
    return new Promise ((resolve, reject) => {
      if (isNil(getState().classifier.workflow[workflowID])) {
        return apiClient.type('workflows').get({id: workflowID}).then(([workflow]) => {
          dispatch(setState(`classifier.workflow.${workflowID}`, workflow))
          dispatch(setState(`classifier.tasks.${workflowID}`, workflow.tasks))
          return resolve()
        }).catch((e) => {
          return reject(e)
        })
      } else {
        return resolve()
      }
   })
  }
}

export function fetchTutorials(workflowID) {
  return dispatch => {
    return new Promise ((resolve) => {
      apiClient.type('tutorials').get({workflow_id: workflowID}).then(([tutorial]) => {
        const tutorialResource = tutorial
        dispatch(setState(`classifier.tutorial.${workflowID}`, tutorialResource))
        if (!isEmpty(tutorial)) {
          let mediaByID = {}
          tutorialResource.get('attached_images').then((mediaResources) => {
            forEach((mediaResource) => mediaByID[mediaResource.id] = mediaResource, mediaResources)
            dispatch(setState(`classifier.tutorial.${workflowID}.mediaResources`, mediaByID))
            return resolve()
          }).catch(() => {
            return resolve()
          })
        } else {
          return resolve()
        }
      }).catch(() => { //does not exist for this project, that is OK
        dispatch(setState(`classifier.tutorial.${workflowID}`, {}))
        return resolve()
      })
    })
  }
}

export function fetchProject(workflowID) {
  return (dispatch, getState) => {
    const workflow = getState().classifier.workflow[workflowID]
    const projectID = workflow.links.project
    return new Promise ((resolve, reject) => {
      apiClient.type('projects').get({id: projectID}).then(([project]) => {
        dispatch(setState(`classifier.project.${workflowID}`, project))
        return resolve()
      }).catch(() => {
        return reject()
      })
   })
  }
}

export function setupProjectPreferences(workflowID) {
  return (dispatch, getState) => {
    const workflow = getState().classifier.workflow[workflowID]
    const projectID = workflow.links.project

    return new Promise ((resolve, reject) => {
      if (getState().user.isGuestUser){
        return resolve()
      }

      dispatch(getAuthUser()).then((userResource) => {
        return userResource
      }).then((userResource)=> {
        userResource.get('project_preferences', {project_id: projectID}).then (([projectPreferences]) => {
          //Before being able to classify on a project, the user needs to have their preference created if it doesn't exist
          if (projectPreferences) {
            return resolve()
          }

          const projectPreference = {
            links: { project: projectID },
            preferences: {}
          }
          apiClient.type('project_preferences').create(projectPreference).save().then((projectPreferenceResource) => {
            return projectPreferenceResource
          }).then((projectPreferenceResource) => {
            projectPreferenceResource.get('project').then((project) => {
              dispatch(setState(`user.projects.${projectID}`, {
                  name: project.display_name,
                  slug: project.slug,
                  activity_count: 0,
                  sort_order: '',
                  tutorials_completed_at: {}
                }
              ))
              return resolve()
            })
          }).catch(() => {
            return reject()
          })
        })
      })
    })
  }
}

export function setNeedsTutorial() {
  return (dispatch, getState) => {
    return new Promise ((resolve) => {
      const workflowID = getState().classifier.currentWorkflowID
      if (!getState().classifier.tutorial[workflowID]) {
        return resolve()
      }

      const projectID = getState().classifier.workflow[workflowID].links.project
      const tutorialID = getState().classifier.tutorial[workflowID].id
      let needsTutorial = getState().classifier.needsTutorial[workflowID] !== undefined ? getState().classifier.needsTutorial[workflowID] : true

      if ((!getState().user.isGuestUser) && (getState().user.projects[projectID])) {
        needsTutorial = !getState().user.projects[projectID]['tutorials_completed_at'][tutorialID]
      }

      dispatch(setState(`classifier.needsTutorial.${workflowID}`, needsTutorial))
      return resolve()
    })
  }
}

export function setTutorialCompleted() {
  return (dispatch, getState) => {
    const workflowID = getState().classifier.currentWorkflowID
    dispatch(setState(`classifier.needsTutorial.${workflowID}`, false))

    if (getState().user.isGuestUser) {
      return
    }
    const now = new Date().toISOString()
    const tutorialID = getState().classifier.tutorial[workflowID].id
    const projectID = getState().classifier.workflow[workflowID].links.project

    dispatch(getAuthUser()).then((userResourse) => {
      userResourse.get('project_preferences', {project_id: projectID}).then (([projectPreferences]) => {
        if (!projectPreferences.preferences.tutorials_completed_at) {
          projectPreferences.preferences.tutorials_completed_at = {}
        }
        const completed = {
          [tutorialID]: now
        }
        projectPreferences.update({
          preferences: {
            tutorials_completed_at: completed
          }
        }).save()
        dispatch(setState(`user.projects.${projectID}.tutorials_completed_at`, completed))
      })
    })
  }
}
