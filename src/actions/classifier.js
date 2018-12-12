import apiClient from 'panoptes-client/lib/api-client'
import R from 'ramda'
import { setState } from '../actions/index'
import { Actions } from 'react-native-router-flux'
import { Alert, Platform, Image} from 'react-native'
import { getAuthUser } from '../actions/auth'
import { saveTutorialAsComplete, setUserProjectData } from '../actions/user';
import * as ActionConstants from '../constants/actions'
import getSubjectLocation from '../utils/get-subject-location'
import { 
  constructDrawingAnnotations
} from '../utils/annotationUtils'
import { clearShapes } from './drawing'

export function addSubjectsForWorklow(workflowId) {
  return dispatch => {
    return apiClient.type('subjects').get({workflow_id: workflowId, sort: 'queued'}).then((subjects) => {
      subjects.forEach((subject) => subject.display = getSubjectLocation(subject))
      dispatch({
        type: ActionConstants.APPEND_SUBJECTS_TO_WORKFLOW,
        workflowId,
        subjects
      })
    })
  }
}

export function startNewClassification(workflow, project) {
  return dispatch => {
    dispatch(clearSubjectsFromWorkflow(workflow.id))
    Promise.all([
      dispatch(requestClassifierData),
      dispatch(setState('loadingText', 'Loading Workflow...')),
      dispatch(addSubjectsForWorklow(workflow.id)),
      dispatch(setupProjectPreferences(workflow.id, project)),
      dispatch(fetchFieldGuide(workflow.id, project.id)),
      dispatch(fetchTutorials(workflow.id)).then(() => dispatch(setNeedsTutorial(workflow.id, project.id))),
      dispatch(setSubjectStartTimeForWorkflow(workflow.id))
    ])
    .then(() => {
      dispatch(setSubjectForWorkflow(workflow.id))
      dispatch(classifierDataSuccess)
    })
    .catch((error) => {
      Alert.alert('Error', `Sorry, the following error occured when loading this workflow. ${error}`,
        [{text: 'Go Back', onPress: () => { Actions.pop()}}]
      )
    })
  }
}

export function saveClassification(workflow, subject, displayDimensions) {
  return (dispatch, getState) => {
    const classifier = getState().classifier
    const subjectStartTime = classifier.subjectStartTime[workflow.id]
    const subjectCompletionTime = (new Date).toISOString()
    const annotations = R.map(a => ({task: a[0], value: a[1]}), R.toPairs(classifier.annotations[workflow.id]))

    dispatch(setSubjectStartTimeForWorkflow(workflow.id))
    dispatch(initializeAnnotation(workflow.id))

    // If we are in preview mode, we skip reporting classifications
    if (classifier.inPreviewMode) {
      return
    }
    
    // Report classification
    let subjectDimensions = []
    const imageSizePromise = new Promise((resolve, reject) => {
      Image.getSize(subject.display.src, (naturalWidth, naturalHeight) => {
        const aspectRatio = Math.min(displayDimensions.height/naturalHeight, displayDimensions.width/naturalWidth)
        const subjectDimensions = {
          naturalWidth,
          naturalHeight,
          clientWidth: displayDimensions.width * aspectRatio,
          clientHeight: displayDimensions.height * aspectRatio
        }
        resolve(subjectDimensions)
      }, reject)
    })
    imageSizePromise.then((imageDimensions) => {
      subjectDimensions = imageDimensions
    }).finally(() => {
      apiClient.type('classifications').create({
        completed: true,
        annotations,
        metadata: {
          workflow_version: workflow.version,
          started_at: subjectStartTime,
          finished_at: subjectCompletionTime,
          user_agent: `${Platform.OS} Mobile App`,
          user_language: 'en',
          utc_offset: ((new Date).getTimezoneOffset() * 60).toString(),
          subject_dimensions: subjectDimensions,
          viewport: { width: getState().app.device.width, height: getState().app.device.height },
          session: getState().main.session.id
        },
        links: {
          project: workflow.links.project,
          workflow: workflow.id,
          subjects: [subject.id]
        }
      }).save()
      dispatch(setSubjectSeenThisSession(workflow.id, subject.id))
    })
  }
}

export function submitDrawingClassification(shapes, workflow, subject, {clientHeight, clientWidth}) {
  return (dispatch, getState) => {
    const { classifier } = getState()
    const subjectStartTime = classifier.subjectStartTime[workflow.id]
    const subjectCompletionTime = (new Date).toISOString()
    const firstTask = workflow.first_task
    const tools = workflow.tasks[firstTask].tools
    const annotations = constructDrawingAnnotations(shapes, tools, firstTask)
    apiClient.type('classifications').create({
      completed: true,
      annotations,
      metadata: {
        workflow_version: workflow.version,
        started_at: subjectStartTime,
        finished_at: subjectCompletionTime,
        user_agent: `${Platform.OS} Mobile App`,
        user_language: 'en',
        utc_offset: ((new Date).getTimezoneOffset() * 60).toString(),
        subject_dimensions: { ...classifier.subjectDimensions[subject.id], clientHeight, clientWidth },
        viewport: { width: getState().app.device.width, height: getState().app.device.height },
        session: getState().main.session.id
      },
      links: {
        project: workflow.links.project,
        workflow: workflow.id,
        subjects: [subject.id]
      }
    }).save()
    
    // Add more subjects if we are getting close to running out
    const subjectList = classifier.subjectLists[workflow.id] || []
    const subjectsSeenThisSession = classifier.seenThisSession[workflow.id] || []
    const usableSubjects = subjectList.filter(subject => !subjectsSeenThisSession.includes(subject.id))
    if (usableSubjects.length < 3) {
      dispatch(addSubjectsForWorklow(workflow.id))
    }
    
    // Mark the subject as completed and move on to the next
    dispatch(setSubjectSeenThisSession(workflow.id, subject.id))
    dispatch(setSubjectForWorkflow(workflow.id))
    dispatch(clearShapes())
  }
}

const setSubjectForWorkflow = (workflowId) => ({
  type: ActionConstants.SET_SUBJECT_FOR_WORKFLOW,
  workflowId
})

export function fetchFieldGuide(workflowId, projectId) {
  return (dispatch) => {
    return new Promise ((resolve) => {
      apiClient.type('field_guides').get({project_id: projectId}).then(([guide]) => {
        if (R.isEmpty(guide.items)) { //no items (clicked add but didn't add anything)
          return resolve()
        } else {
          let icons = {}
          guide.get('attached_images').then((images) => {
            R.forEach((image) => icons[image.id] = image, images)
            guide.icons = icons
            return resolve()
          }).finally(() => {
            dispatch(setGuideForWorkflow(workflowId, guide))
          })
        }
      }).catch(() => {
        return resolve()
      })
    })
  }
}

export function fetchTutorials(workflowID) {
  return dispatch => {
    return new Promise ((resolve) => {
      apiClient.type('tutorials').get({workflow_id: workflowID}).then(([tutorial]) => {
        let tutorialResource = tutorial
        let mediaByID = {}
        tutorialResource.get('attached_images').then((mediaResources) => {
          R.forEach((mediaResource) => mediaByID[mediaResource.id] = mediaResource, mediaResources)
        }).finally(() => {
          tutorialResource.mediaResources = mediaByID
          dispatch(addTutorial(workflowID, tutorialResource))
          resolve()
        })
      }).catch(() => { //does not exist for this project, that is OK
        dispatch(addTutorial(workflowID, {}))
        resolve()
      })
    })
  }
}

export function setupProjectPreferences(workflowID, project) {
  return (dispatch, getState) => {
    return new Promise ((resolve, reject) => {
      if (getState().user.isGuestUser){
        return resolve()
      }

      getAuthUser().then((userResource)=> {
        userResource.get('project_preferences', {project_id: project.id}).then (([projectPreferences]) => {
          //Before being able to classify on a project, the user needs to have their preference created if it doesn't exist
          if (projectPreferences) {
            return resolve()
          }

          const projectPreference = {
            links: { project: project.id },
            preferences: {}
          }

          apiClient.type('project_preferences').create(projectPreference).save().then(() => {
            const projectData = {
              name: project.display_name,
              slug: project.slug,
              activity_count: 0,
              sort_order: '',
              tutorials_completed_at: {}
            };
            dispatch(setUserProjectData(project.id, projectData));
            return resolve()
          }).catch(() => {
            return reject()
          })
        })
      })
    })
  }
}

export function setNeedsTutorial(workflowId, projectId) {
  return (dispatch, getState) => {
    return new Promise ((resolve) => {
      if (R.isEmpty(getState().classifier.tutorial[workflowId])) {
        dispatch(setNeedsTutorialAction(workflowId, false))
        return resolve()
      }

      const tutorialID = getState().classifier.tutorial[workflowId].id
      let needsTutorial = getState().classifier.needsTutorial[workflowId] !== undefined ? getState().classifier.needsTutorial[workflowId] : true

      if ((!getState().user.isGuestUser) && (getState().user.projects[projectId])) {
        needsTutorial = !getState().user.projects[projectId]['tutorials_completed_at'][tutorialID]
      }

      dispatch(setNeedsTutorialAction(workflowId, needsTutorial))
      return resolve()
    })
  }
}

export function setTutorialCompleted(workflowId, projectId) {
  return (dispatch, getState) => {
    dispatch(setNeedsTutorialAction(workflowId, false))

    if (getState().user.isGuestUser) {
      return
    }
    const now = new Date().toISOString()
    const tutorialId = getState().classifier.tutorial[workflowId].id

    getAuthUser().then((userResourse) => {
      userResourse.get('project_preferences', {project_id: projectId}).then (([projectPreferences]) => {
        if (!projectPreferences.preferences.tutorials_completed_at) {
          projectPreferences.preferences.tutorials_completed_at = {}
        }
        projectPreferences.update({[`preferences.tutorials_completed_at.${tutorialId}`]: now}).save()
        dispatch(saveTutorialAsComplete(projectId, tutorialId, now));
      })
    })
  }
}

export const addAnnotationToTask = (workflowId, task, annotation, asList) => ({
  type: ActionConstants.ADD_ANNOTATION_TO_TASK,
  workflowId,
  task,
  annotation,
  asList
})

export const removeAnnotationFromTask = (workflowId, task, annotation) => ({
  type: ActionConstants.REMOVE_ANNOTATION_FROM_TASK,
  workflowId,
  task,
  annotation,
})

const setSubjectSeenThisSession = (workflowId, subjectId) => ({
  type: ActionConstants.SET_SUBJECT_SEEN_THIS_SESSION,
  workflowId,
  subjectId
})

export const setQuestionContainerHeight = (workflowId, questionContainerHeight) => ({
  type: ActionConstants.SET_QUESTION_CONTAINER_HEIGHT,
  workflowId,
  questionContainerHeight
})

export const clearClassifierData = () => ({
  type: ActionConstants.CLEAR_CLASSIFIER_DATA
})

export const setClassifierTestMode = (isTestMode) => ({
  type: ActionConstants.SET_CLASSIFIER_TEST_MODE,
  isTestMode
})

const clearSubjectsFromWorkflow = (workflowId) => ({
  type: ActionConstants.CLEAR_SUBJECTS_FROM_WORKFLOW,
  workflowId,
})

const setSubjectStartTimeForWorkflow = (workflowId) => ({
  type: ActionConstants.SET_SUBJECT_START_TIME,
  workflowId
})

export const setSubjectSizeInWorkflow = (subjectId, {width, height}) => ({
  type: ActionConstants.SET_SUBJECT_DIMENSIONS,
  subjectId,
  subjectDimensions: {naturalWidth: width, naturalHeight: height}
})

const addTutorial = (workflowId, tutorial) => ({
  type: ActionConstants.ADD_CLASSIFIER_TUTORIAL,
  workflowId,
  tutorial
})

const setNeedsTutorialAction = (workflowId, needsTutorial) => ({
  type: ActionConstants.ADD_WORKFLOW_NEEDS_TUTORIAL,
  workflowId,
  needsTutorial
})

const setGuideForWorkflow = (workflowId, guide) => ({
  type: ActionConstants.SET_CLASSIFIER_GUIDE,
  workflowId,
  guide
})

const initializeAnnotation = (workflowId) => ({
  type: ActionConstants.INITIALIZE_ANNOTATION,
  workflowId,
})

const requestClassifierData = {
  type: ActionConstants.REQUEST_CLASSIFIER_DATA
}

const classifierDataSuccess = {
  type: ActionConstants.CLASSIFIER_DATA_SUCCESS
}

const classifierDataFailure = {
  type: ActionConstants.CLASSIFIER_DATA_FAILURE
}
