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
      const workflowID = getState().classifier.currentWorkflowID
      const upcomingSubjects = getState().classifier.upcomingSubjects[workflowID] || []

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

export function setSubjectsToDisplay() {
  return (dispatch, getState) => {
    return new Promise ((resolve) => {
      const workflowID = getState().classifier.currentWorkflowID
      const upcomingSubjects = getState().classifier.upcomingSubjects[workflowID]
      let subject = upcomingSubjects[0]
      subject.display = getSubjectLocation(subject)

      const isFirstSubject = isNil(getState().classifier.subjectSizes[workflowID])
      function initFirstSubject(){
        return dispatch(setImageSizes(subject)).then(() => {
          return dispatch(setNextSubject())
        })
      }

      function setupSubjects(){
        return isFirstSubject ? initFirstSubject() : Promise.resolve()
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
      const workflowID = getState().classifier.currentWorkflowID
      const upcomingSubjects = getState().classifier.upcomingSubjects[workflowID]
      let nextSubject = upcomingSubjects[1]

      nextSubject.display = getSubjectLocation(nextSubject)
      dispatch(setState(`classifier.nextSubject.${workflowID}`, nextSubject))
      return resolve()
    })
  }
}

export function setImageSizes(subject) {
  return (dispatch, getState) => {
    return new Promise ((resolve) => {
      const workflowID = getState().classifier.currentWorkflowID

      Image.getSize(subject.display.src, (width, height) => {
        const subjectDisplayWidth = getState().device.subjectDisplayWidth
        const subjectDisplayHeight = getState().device.subjectDisplayHeight
        const aspectRatio = Math.min(subjectDisplayWidth / width, subjectDisplayHeight / height)

        const subjectSizes = {
          actualWidth: width,
          actualHeight: height,
          resizedWidth: width * aspectRatio,
          resizedHeight: height * aspectRatio
        }

        dispatch(setState(`classifier.subjectSizes.${workflowID}`, subjectSizes))
        return resolve()
      }, (error) => {
        dispatch(setState(`classifier.subjectSizes.${workflowID}`, {}))
        dispatch(setState('error', error))
        return resolve()
      })
    })
  }
}
