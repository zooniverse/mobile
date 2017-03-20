import apiClient from 'panoptes-client/lib/api-client'
import { isNil } from 'ramda'
import { displayError, setState } from '../actions/index'
import { Actions } from 'react-native-router-flux'

export function startNewClassification(workflowID) {
  return (dispatch) => {
    dispatch(setState('classifier.isFetching', true))
    dispatch(setState('loadingText', 'Loading Workflow...'))
    dispatch(setState('classifier.currentWorkflowID', workflowID))
    dispatch(fetchWorkflow(workflowID)).then(() => {
      dispatch(setState('classifier.isFetching', false))
    }).catch((e) => {
      dispatch(displayError(`Sorry, but there was an error loading this workflow.  Please try again later. ${e}`))
      dispatch(setState('classifier.isFetching', false))
      Actions.pop()  //go back to previous screen
    })
  }
}

export function fetchWorkflow(workflowID) {
  return (dispatch, getState) => {
    return new Promise ((resolve) => {
      if (isNil(getState().classifier.workflow[workflowID])) {
        return apiClient.type('workflows').get({id: workflowID}).then(([workflow]) => {
          dispatch(setState(`classifier.workflow.${workflowID}`, workflow))
          dispatch(setState(`classifier.tasks.${workflowID}`, workflow.tasks))
          return resolve()
        })
      } else {
        return resolve()
      }
   })
  }
}
