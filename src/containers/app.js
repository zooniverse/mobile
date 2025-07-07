import React, {Component} from 'react'
import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from '@redux-devtools/extension';
import {
  AppState,
} from 'react-native'
import NetInfo from '@react-native-community/netinfo';
import { Provider } from 'react-redux'
import reducer from '../reducers/index'
import { thunk } from 'redux-thunk'
import { setIsConnected, setState } from '../actions/index'
import { loadUserData } from '../actions/user'
import { setSession } from '../actions/session'
import EStyleSheet from 'react-native-extended-stylesheet'
import SplashScreen from 'react-native-splash-screen';
import { persistStore, persistReducer } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'
import SafeAreaContainer from './SafeAreaContainer'
import { setPageShowing } from '../actions/navBar'
import PageKeys from '../constants/PageKeys'
import RootNavigator from "../navigation/RootNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sentry from '@sentry/react-native';
import { PushNotifications, IncomingNotifications } from '../notifications';
import '../i18n';
import LanguageEffect from '../components/settings/LanguageEffect';

Sentry.init({
    dsn: 'https://334e2b2ca1c04dc4a7fc356e394e9ea8@o274434.ingest.sentry.io/5371400',
    enableNative: process.env.NODE_ENV === 'production' ? true : false,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['images', 'user', 'settings', 'notifications', 'notificationSettings', 'languageSettings'] // All these stores will be persisted
};

const persistedReducer = persistReducer(persistConfig, reducer)
export const store = createStore(persistedReducer, composeWithDevTools(applyMiddleware(thunk)))
const persistor = persistStore(store, {}, () => {
  // Setup push notifications here because you want to make sure existing settings are loaded.
  PushNotifications.setupPushNotifications();
})


export default class App extends Component {
  componentDidMount() {
    SplashScreen.hide()
    
    IncomingNotifications.handleIncomingNotifications();

    const handleAppStateChange = currentAppState => {
      if (currentAppState === 'active') {
        store.dispatch(loadUserData())
      }
    }
    AppState.addEventListener('change', handleAppStateChange)

    const dispatchConnected = isConnected => store.dispatch(setIsConnected(isConnected))
    NetInfo.fetch().then((state) => {
      store.dispatch(setState("isConnected", state.isConnected.isConnected));
      NetInfo.addEventListener((state) => dispatchConnected(state));
    })
  }

  /**
   * This function is called after the persistent store has been loaded
   */
  onBeforeLift() {
    store.dispatch(loadUserData())
    store.dispatch(setSession())
    store.dispatch(setPageShowing(PageKeys.ZooniverseApp))
  }

  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor} onBeforeLift={this.onBeforeLift}>
          <LanguageEffect />
          <SafeAreaContainer>
            <RootNavigator />
          </SafeAreaContainer>
        </PersistGate>
      </Provider>
    );
  }
}

const styles = EStyleSheet.create({
  sharedSceneStyles: {
    backgroundColor: '$backgroundColor'
  }
})
