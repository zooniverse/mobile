import { merge } from 'ramda'

export const InitialState = {
  userID: null
}

export default function(state=InitialState, action) {
  switch (action.type) {
    case 'SET_USER':
      return merge(state, {
        userID: action.id
      })
    default:
      return InitialState;
  }
}
