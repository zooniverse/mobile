import apiClient from 'panoptes-client/lib/api-client'
import { forEach, isEmpty, isNil, map, remove, toPairs } from 'ramda'
import { addState, removeState, setState } from '../actions/index'
import { Actions } from 'react-native-router-flux'
import { Alert, Platform } from 'react-native'
import { getAuthUser } from '../actions/auth'
import { loadSubjects, setSubjectsToDisplay } from '../actions/subject'

export function startNewClassification(workflowID) {
  return (dispatch, getState) => {
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
      if (getState().classifier.guide[workflowID] !== undefined) {
        return
      }
      return dispatch(fetchFieldGuide(workflowID))
    }).then(() => {
      dispatch(setState('loadingText', 'Loading Subjects...'))
      return dispatch(loadSubjects())
    }).then(() => {
      return dispatch(setSubjectsToDisplay())
    }).then(() => {
      //now we can create the first classification!!
      const subject = getState().classifier.subject[workflowID]
      const workflow = getState().classifier.workflow[workflowID]
      return apiClient.type('classifications').create({
        annotations: [],
        metadata: {
          workflow_version: workflow.version,
          started_at: (new Date).toISOString(),
          user_agent: `${Platform.OS} Mobile App`,
          user_language: 'en', //TODO: Will be fixed subsequent PR
          utc_offset: ((new Date).getTimezoneOffset() * 60).toString(),
          subject_dimensions: []
        },
        links: {
          project: workflow.links.project,
          workflow: workflow.id,
          subjects: [subject.id]
        }
      })
    }).then((classification) => {
      dispatch(setState(`classifier.classification.${workflowID}`, classification))
      dispatch(setState('classifier.isFetching', false))
    }).catch(() => {
      Alert.alert('Error', 'Sorry, but there was an error loading this workflow.  Please try again later.',
        [{text: 'Go Back', onPress: () => { Actions.pop()}}]
      )
    })
  }
}

export function saveAnnotation(task, value) {
  return (dispatch, getState) => {
    const workflowID = getState().classifier.currentWorkflowID
    dispatch(setState(`classifier.annotations.${workflowID}.${task}`, value))
  }
}

export function removeAnnotationValue(task, value) {
  return (dispatch, getState) => {
    const workflowID = getState().classifier.currentWorkflowID
    dispatch(removeState(`classifier.annotations.${workflowID}.${task}`, value))
  }
}

export function saveThenStartNewClassification() {
  return (dispatch, getState) => {
    const classifier = getState().classifier
    const workflowID = classifier.currentWorkflowID
    const classification = classifier.classification[workflowID]
    const subject = classifier.subject[workflowID]
    const subjectSizes = classifier.subjectSizes[workflowID]

    const structureAnnotation = (a) => { return { task: a[0], value: a[1] } }
    const annotations = map(structureAnnotation, toPairs(classifier.annotations[workflowID]))

    const subjectDimensions = {
      naturalWidth: subjectSizes.actualWidth,
      naturalHeight: subjectSizes.actualHeight,
      clientWidth: subjectSizes.resizedWidth,
      clientHeight: subjectSizes.resizedHeight
    }
    const updates = {
      annotations: annotations,
      completed: true,
      'metadata.session': getState().session.id,
      'metadata.finished_at': (new Date).toISOString(),
      'metadata.viewport': { width: getState().device.width, height: getState().device.height},
      'metadata.subject_dimensions.0': subjectDimensions
    }

    classification.update(updates)

    classification.save().then(() => {
      //Remove this subject just saved from upcoming subjects
      const workflowID = getState().classifier.currentWorkflowID
      const oldSubjectList = getState().classifier.upcomingSubjects[workflowID]
      const newSubjectList = remove(0, 1, oldSubjectList)
      dispatch(setState(`classifier.upcomingSubjects.${workflowID}`, newSubjectList))
      //Mark this subject as seen
      dispatch(addState(`classifier.seenThisSession.${workflowID}`, subject.id))
      dispatch(startNewClassification(workflowID))

      dispatch(setState(`classifier.annotations.${workflowID}`, {}))
    })
  }
}

export function fetchWorkflow(workflowID) {
  return (dispatch, getState) => {
    return new Promise ((resolve, reject) => {
      if (!isNil(getState().classifier.workflow[workflowID])) {
        return resolve()
      }

      return apiClient.type('workflows').get({id: workflowID}).then(([workflow]) => {
        dispatch(setState(`classifier.workflow.${workflowID}`, workflow))
        dispatch(setState(`classifier.tasks.${workflowID}`, workflow.tasks))
        return resolve()
      }).catch((e) => {
        return reject(e)
      })
   })
  }
}

export function fetchFieldGuide(workflowID) {
  return (dispatch, getState) => {
    const projectID = getState().classifier.workflow[workflowID].links.project
    return new Promise ((resolve) => {
      apiClient.type('field_guides').get({project_id: projectID}).then(([guide]) => {
        if (isEmpty(guide.items)) { //no items (clicked add but didn't add anything)
          return resolve()
        } else {
          dispatch(setState(`classifier.guide.${workflowID}`, guide))
          let icons = {}
          guide.get('attached_images').then((images) => {
            forEach((image) => icons[image.id] = image, images)
            dispatch(setState(`classifier.guide.${workflowID}.icons`, icons))
            return resolve()
          })
        }
      }).catch(() => { //does not exist for this project
        return resolve()
      })
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
    const project = getState().classifier.project[workflowID]
    const projectID = workflow.links.project

    return new Promise ((resolve, reject) => {
      if (getState().user.isGuestUser){
        return resolve()
      }

      dispatch(getAuthUser()).then((userResource)=> {
        userResource.get('project_preferences', {project_id: projectID}).then (([projectPreferences]) => {
          //Before being able to classify on a project, the user needs to have their preference created if it doesn't exist
          if (projectPreferences) {
            return resolve()
          }

          const projectPreference = {
            links: { project: projectID },
            preferences: {}
          }

          apiClient.type('project_preferences').create(projectPreference).save().then(() => {
            dispatch(setState(`user.projects.${projectID}`, {
                name: project.display_name,
                slug: project.slug,
                activity_count: 0,
                sort_order: '',
                tutorials_completed_at: {}
              }
            ))
            return resolve()
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
        projectPreferences.update({[`preferences.tutorials_completed_at.${tutorialID}`]: now}).save()
        dispatch(setState(`user.projects.${projectID}.tutorials_completed_at.${tutorialID}`, now))
      })
    })
  }
}
