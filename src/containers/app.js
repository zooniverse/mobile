import React, {Component} from 'react'
import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension';
import { AppState, NetInfo, Platform } from 'react-native'
import { Provider } from 'react-redux'
import reducer from '../reducers/index'
import thunkMiddleware from 'redux-thunk'
import {Scene, Router, Drawer} from 'react-native-router-flux'
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
import Settings from '../components/Settings'
import SideDrawerContent from '../components/SideDrawerContent'
import ZooWebView from '../components/ZooWebView'
import SwipeClassifier from '../components/classifier/SwipeClassifier'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { PersistGate } from 'redux-persist/integration/react'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['images'] // only images will be persisted
};

const persistedReducer = persistReducer(persistConfig, reducer)
const store = createStore(persistedReducer, composeWithDevTools(applyMiddleware(thunkMiddleware)))
const persistor = persistStore(store)


export default class App extends Component {
  componentDidMount() {
    if (Platform.OS === 'android') {
      SplashScreen.hide()
    }
    store.dispatch(loadUserData())
    store.dispatch(setSession())

    const handleAppStateChange = currentAppState => {
      if (currentAppState === 'active') {
        store.dispatch(loadUserData())
      }
    }
    AppState.addEventListener('change', handleAppStateChange)

    const dispatchConnected = isConnected => store.dispatch(setIsConnected(isConnected))
    NetInfo.isConnected.fetch().then(isConnected => {
      store.dispatch(setState('isConnected', isConnected))
      NetInfo.isConnected.addEventListener('connectionChange', dispatchConnected)
    })
  }

  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Router sceneStyle={styles.sharedSceneStyles}>
            <Drawer key="drawer" contentComponent={SideDrawerContent} open={false} drawerPosition="right">
              <Scene key="main" tabs={false}>
                <Scene key="SignIn" component={SignIn} duration={0} type="reset" navBar={SignIn.renderNavigationBar} />
                <Scene key="ZooniverseApp" component={ZooniverseApp} navBar={ZooniverseApp.renderNavigationBar} initial />
                <Scene key="ProjectDisciplines" component={ProjectDisciplines} navBar={ProjectDisciplines.renderNavigationBar} />
                <Scene key="About" component={About} navBar={About.renderNavigationBar}/>
                <Scene key="Publications" component={PublicationList} navBar={PublicationList.renderNavigationBar} />
                <Scene key="ProjectList" component={ProjectList} navBar={ProjectList.renderNavigationBar} />
                <Scene key="Register" component={Register} navBar={Register.renderNavigationBar} />
                <Scene key="Settings" component={Settings} navBar={Settings.renderNavigationBar} />
                <Scene key="ZooWebView" component={ZooWebView} duration={0} navBar={ZooWebView.renderNavigationBar} />
                <Scene key="SwipeClassifier" component={SwipeClassifier} panHandlers={null} navBar={SwipeClassifier.renderNavigationBar}/>
              </Scene>
            </Drawer>
          </Router>
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