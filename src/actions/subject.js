import apiClient from 'panoptes-client/lib/api-client'
import { isNil, length, prepend } from 'ramda'
import { setState } from '../actions/index'
import { Image } from 'react-native'
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

export function loadSubjects() {
  return (dispatch, getState) => {
    return new Promise ((resolve, reject) => {
      const workflowID = getState().main.classifier.currentWorkflowID
      const upcomingSubjects = getState().main.classifier.upcomingSubjects[workflowID] || []

      if (length(upcomingSubjects) > 1) {
        return resolve()
      }

      dispatch(fetchUpcomingSubjects(workflowID)).then((subjects) => {
        //if this is the last subject we need to keep it around
        const subjectList = (length(upcomingSubjects) === 1) ? prepend(upcomingSubjects[0], subjects) : subjects
        dispatch(setState(`classifier.upcomingSubjects.${workflowID}`, subjectList))
        return resolve()
      }, (error) => {
        dispatch(setState('error', error))
        return reject()
      })
    })
  }
}

export function setSubjectsToDisplay(isFirstSubject) {
  return (dispatch, getState) => {
    return new Promise ((resolve) => {
      const workflowID = getState().main.classifier.currentWorkflowID
      const upcomingSubjects = getState().main.classifier.upcomingSubjects[workflowID]
      let subject = upcomingSubjects[0]
      subject.display = getSubjectLocation(subject)

      function setupSubjects(){
        return isFirstSubject ? dispatch(setNextSubject()) : Promise.resolve()
      }

      setupSubjects().then(() => {
        dispatch(setState(`classifier.subject.${workflowID}`, subject))
        return resolve()
      })
    })
  }
}

export function setNextSubject() {
  return (dispatch, getState) => {
    return new Promise ((resolve) => {
      const workflowID = getState().main.classifier.currentWorkflowID
      const upcomingSubjects = getState().main.classifier.upcomingSubjects[workflowID]
      let nextSubject = upcomingSubjects[1]

      nextSubject.display = getSubjectLocation(nextSubject)
      dispatch(setState(`classifier.nextSubject.${workflowID}`, nextSubject))
      return resolve()
    })
  }
}
