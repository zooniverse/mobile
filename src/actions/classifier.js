import apiClient from 'panoptes-client/lib/api-client'
import { isNil } from 'ramda'
import { setState } from '../actions/index'
import { Actions } from 'react-native-router-flux'
import { Alert } from 'react-native'

export function startNewClassification(workflowID) {
  return (dispatch) => {
    dispatch(setState('loadingText', 'Loading Workflow...'))
    dispatch(setState('classifier.currentWorkflowID', workflowID))
    dispatch(fetchWorkflow(workflowID)).then(() => {
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
