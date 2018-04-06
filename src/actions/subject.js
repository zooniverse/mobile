import apiClient from 'panoptes-client/lib/api-client'
import { length, prepend } from 'ramda'
import { setState } from '../actions/index'
import { 
  setUpcomingSubjectsForWorkflow,
  setSubjectForWorkflowId,
  setNextSubjectForWorkflowId,
} from './classifier'
import getSubjectLocation from '../utils/get-subject-location'

export function fetchUpcomingSubjects(workflowID) {
  return dispatch => {
    return new Promise ((resolve, reject) => {
      apiClient.type('subjects').get({workflow_id: workflowID, sort: 'queued'}).then((subjects) => {
        return resolve(subjects)
      }).catch((error) => {
        dispatch(setState('error', error))
        return reject(error)
      })
    })
  }
}

export function loadSubjects(workflowId) {
  return (dispatch, getState) => {
    return new Promise ((resolve, reject) => {
      const upcomingSubjects = getState().classifier.upcomingSubjects[workflowId] || []

      if (length(upcomingSubjects) > 1) {
        return resolve()
      }

      dispatch(fetchUpcomingSubjects(workflowId)).then((subjects) => {
        //if this is the last subject we need to keep it around
        const subjectList = (length(upcomingSubjects) === 1) ? prepend(upcomingSubjects[0], subjects) : subjects
        dispatch(setUpcomingSubjectsForWorkflow(workflowId, subjectList))
        return resolve()
      }, (error) => {
        dispatch(setState('error', error))
        return reject()
      })
    })
  }
}

export function setSubjectsToDisplay(isFirstSubject, workflowId) {
  return (dispatch, getState) => {
    return new Promise ((resolve) => {
      const upcomingSubjects = getState().classifier.upcomingSubjects[workflowId]
      let subject = upcomingSubjects[0]
      subject.display = getSubjectLocation(subject)

      function setupSubjects(){
        return isFirstSubject ? dispatch(setNextSubject(workflowId)) : Promise.resolve()
      }

      setupSubjects().then(() => {
        dispatch(setSubjectForWorkflowId(workflowId, subject))
        return resolve()
      })
    })
  }
}

export function setNextSubject(workflowId) {
  return (dispatch, getState) => {
    return new Promise ((resolve) => {
      const upcomingSubjects = getState().classifier.upcomingSubjects[workflowId]
      console.log(`workflowID ${workflowId}`)
      console.log(upcomingSubjects)
      let nextSubject = upcomingSubjects[1]
      if (nextSubject) {
        nextSubject.display = getSubjectLocation(nextSubject)
      }
      dispatch(setNextSubjectForWorkflowId(workflowId, nextSubject))
      return resolve()
    })
  }
}
