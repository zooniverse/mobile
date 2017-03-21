import store from 'react-native-simple-store'
import { setState } from '../actions/index'
import { generateSessionID, fiveMinutesFromNow } from '../utils/session'

export function storeSession(session) {
  return () => {
    store.save('@zooniverse:session', {
      session
    })
  }
}

export function setSession() {
  return dispatch => {
    let stored = {}
    store.get('@zooniverse:session').then(json => {
      stored = json.session
      if (stored.ttl < Date.now()) {
        stored.id = generateSessionID().id
      } else {
        stored.ttl = fiveMinutesFromNow()
      }

      dispatch(storeSession(stored))
      dispatch(setState('session', stored))
    }).catch(() => { //nothing here, generate a new session ID
      stored = generateSessionID()
      dispatch(storeSession(stored))
    })
  }
}
