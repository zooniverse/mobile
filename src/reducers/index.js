import { merge } from 'ramda'

export const InitialState = {
  user: {},
  isFetching: false,
  errorMessage: null,
  isConnected: null,
  projectList: []
}

export default function(state=InitialState, action) {
  switch (action.type) {
    case 'SET_USER':
      return merge(state, {
        user: action.user
      })
    case 'SET_IS_FETCHING':
      return merge(state, {
        isFetching: action.isFetching
      })
    case 'SET_ERROR':
      return merge(state, {
        errorMessage: action.errorMessage
      })
    case 'SET_IS_CONNECTED':
      return merge(state, {
        isConnected: action.isConnected
      })
    case 'SET_PROJECT_LIST':
      return merge(state, {
        projectList: action.projectList
      })
    default:
      return InitialState;
  }
}
