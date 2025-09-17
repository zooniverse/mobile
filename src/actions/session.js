import AsyncStorage from '@react-native-async-storage/async-storage';
import { setState } from '../actions/index'
import { generateSessionID, fiveMinutesFromNow } from '../utils/session'

export function storeSession(session) {
  try {
    AsyncStorage.setItem('@zooniverse:session', JSON.stringify(session)).then(
      data => {
        return data;
      },
    );
  } catch (e) {
    console.warn('issue saving the session');
  }
}

export function setSession() {
  return dispatch => {
    let stored = {};
    AsyncStorage.getItem('@zooniverse:session')
      .then(json => {
        stored = JSON.parse(json);
        if (stored.ttl < Date.now()) { // Shouldn't this have been called?
          stored.id = generateSessionID().id;
        } else {
          stored.ttl = fiveMinutesFromNow();
        }
        dispatch(storeSession(stored))
        dispatch(setState('session', stored))
      })
      .catch(() => {
        stored = generateSessionID()
        storeSession(stored)
        dispatch(setState('session', stored))
      });
  };
}
