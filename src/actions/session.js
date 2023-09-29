// import store from 'react-native-simple-store'
import AsyncStorage from '@react-native-async-storage/async-storage';
import {setState} from '../actions/index';
import {generateSessionID, fiveMinutesFromNow} from '../utils/session';

export function storeSession(session) {
  try {
    AsyncStorage.setItem('@zooniverse:session', JSON.stringify(session)).then(
      data => {
        return data;
      },
    );
  } catch (e) {
    // saving error
    console.error('issue saving the session');
  }
  //   return () => {
  //     store.save('@zooniverse:session', {
  //       session,
  //     });
  //   };
}

export function setSession() {
  return dispatch => {
    let stored = {};
    AsyncStorage.getItem('@zooniverse:session')
      .then(json => {
        // stored = json.session;
        stored = JSON.parse(json);
        if (stored.ttl < Date.now()) { // Shouldn't this have been called?
          stored.id = generateSessionID().id;
        } else {
          stored.ttl = fiveMinutesFromNow();
        }
        dispatch(storeSession(stored));
        dispatch(setState('session', stored));
      })
      .catch(() => {
        //nothing here, generate a new session ID
        stored = generateSessionID();
        dispatch(storeSession(stored));
        dispatch(setState('session', stored));
      });
  };
}
