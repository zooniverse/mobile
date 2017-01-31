//Use for user-specific data
import store from 'react-native-simple-store'
import { Actions } from 'react-native-router-flux'
import { head } from 'ramda'

import { setState } from '../actions/index'
import { getAuthUser } from '../actions/auth'


export function syncUserStore() {
  return (dispatch, getState) => {
    const user = getState().user
    return store.save('@zooniverse:user', {
      user
    })
  }
}

export function setUserFromStore() {
  return dispatch => {
    return new Promise ((resolve, reject) => {
      store.get('@zooniverse:user').then(json => {
        dispatch(setState('user', json.user))
        return resolve()
      }).catch(() => {
        return reject()
      })
    })
  }
}

export function loadUserData() {
  return (dispatch, getState) => {
    dispatch(setUserFromStore()).then(() => {
      if (getState().user.isGuestUser) {
        return
      } else {
        return Promise.all([
          dispatch(loadUserAvatar()), //will have more added
        ])
      }
    }).then(() => {
      dispatch(syncUserStore())
    }).catch(() => {
      Actions.SignIn()
    })
  }
}

export function loadUserAvatar() {
  return (dispatch) => {
    return new Promise ((resolve) => {
      dispatch(getAuthUser()).then((userResource) => {
        userResource.get('avatar').then((avatar) => {
          dispatch(setState('user.avatar', head(avatar)))
        }).catch(() => {
          dispatch(setState('user.avatar', {}))
        }).then(() => {
          return resolve()
        })
      })
    })
  }
}
