import React, {Component} from 'react'
import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension';
import {
  AppState,
  Platform,
} from 'react-native'
import NetInfo from '@react-native-community/netinfo';
import { Provider } from 'react-redux'
import reducer from '../reducers/index'
import thunkMiddleware from 'redux-thunk'
import { setIsConnected, setState } from '../actions/index'
import { loadUserData } from '../actions/user'
import { setSession } from '../actions/session'
import EStyleSheet from 'react-native-extended-stylesheet'
import SplashScreen from 'react-native-splash-screen';
import ZooniverseApp from './zooniverseApp'
import ProjectList from '../components/projects/ProjectList'
import ProjectDisciplines from '../components/ProjectDisciplines'
import About from '../components/About'
import PublicationList from '../components/PublicationList'
import SignIn from '../components/SignIn'
import Register from '../components/Register'
import Settings from '../components/settings/Settings'
import SideDrawerContent from '../components/SideDrawerContent'
import ZooWebView from '../components/ZooWebView'
import SwipeClassifier from '../components/classifier/SwipeClassifier'
import WebViewScreen from '../components/WebViewScreen'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { PersistGate } from 'redux-persist/integration/react'
import DrawingClassifier from '../components/Markings/DrawingClassifier'
import QuestionClassifier from '../components/classifier/QuestionClassifier'
import MultiAnswerClassifier from '../components/classifier/MultiAnswerClassifier'
import SafeAreaContainer from './SafeAreaContainer'
import { setPageShowing } from '../actions/navBar'
import NavBar from '../components/NavBar';
import PageKeys from '../constants/PageKeys'
import RootNavigator from "../navigation/RootNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sentry from '@sentry/react-native';

Sentry.init({
    dsn: 'https://334e2b2ca1c04dc4a7fc356e394e9ea8@o274434.ingest.sentry.io/5371400',
    enableNative: process.env.NODE_ENV === 'production' ? true : false,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['images', 'user', 'settings'] // All these stores will be persisted
};

const persistedReducer = persistReducer(persistConfig, reducer)
const store = createStore(persistedReducer, composeWithDevTools(applyMiddleware(thunkMiddleware)))
const persistor = persistStore(store)


export default class App extends Component {
  componentDidMount() {
    SplashScreen.hide()

    const handleAppStateChange = currentAppState => {
      if (currentAppState === 'active') {
        store.dispatch(loadUserData())
      }
    }
    AppState.addEventListener('change', handleAppStateChange)

    const dispatchConnected = isConnected => store.dispatch(setIsConnected(isConnected))
    NetInfo.isConnected.fetch().then(isConnected => {
      store.dispatch(setState('isConnected', isConnected))
      NetInfo.fetch().then((state) => {
        store.dispatch(setState("isConnected", state.isConnected.isConnected));
        NetInfo.addEventListener((state) => dispatchConnected(state));
      })
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
