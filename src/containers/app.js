import React, {Component} from 'react'
import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension';
import {
  AppState,
  NetInfo,
  Platform,
} from 'react-native'
import { Provider } from 'react-redux'
import reducer from '../reducers/index'
import thunkMiddleware from 'redux-thunk'
import {Scene, Router, Drawer, Actions} from 'react-native-router-flux'
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
import SafeAreaContainer from './SafeAreaContainer'
import { setPageShowing } from '../actions/navBar'
import NavBar from '../components/NavBar';
import PageKeys from '../constants/PageKeys'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['images', 'user', 'settings'] // All these stores will be persisted
};

const persistedReducer = persistReducer(persistConfig, reducer)
const store = createStore(persistedReducer, composeWithDevTools(applyMiddleware(thunkMiddleware)))
const persistor = persistStore(store)


export default class App extends Component {
  componentDidMount() {
    if (Platform.OS === 'android') {
      SplashScreen.hide()
    }

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

  /**
   * This function is called after the persistent store has been loaded
   */
  onBeforeLift() {
    store.dispatch(loadUserData())
    store.dispatch(setSession())
    store.dispatch(setPageShowing(PageKeys.ZooniverseApp))
  }

  onSceneChange() {
    store.dispatch(setPageShowing(Actions.currentScene))
  }

  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor} onBeforeLift={this.onBeforeLift}>
          <SafeAreaContainer>
            <Router sceneStyle={styles.sharedSceneStyles} navBar={() => <NavBar />} onStateChange={this.onSceneChange} >
              <Drawer key="drawer" contentComponent={SideDrawerContent} open={false} drawerPosition="right">
                  <Scene key="main" tabs={false} drawerLockMode={'locked-closed'}>
                    <Scene key={PageKeys.SignIn} component={SignIn} duration={0} type="reset"  />
                    <Scene key={PageKeys.ZooniverseApp} component={ZooniverseApp}  initial />
                    <Scene key={PageKeys.ProjectDisciplines} component={ProjectDisciplines}  />
                    <Scene key={PageKeys.About} component={About} />
                    <Scene key={PageKeys.Publications} component={PublicationList}  />
                    <Scene key={PageKeys.ProjectList} component={ProjectList}  />
                    <Scene key={PageKeys.Register} component={Register} />
                    <Scene key={PageKeys.Settings} component={Settings}  />
                    <Scene key={PageKeys.ZooWebView} component={ZooWebView} duration={0}  />
                    <Scene key={PageKeys.SwipeClassifier} component={SwipeClassifier} panHandlers={null} />
                    <Scene key={PageKeys.WebView} component={WebViewScreen} />
                    <Scene key={PageKeys.QuestionClassifier} component={QuestionClassifier} />
                    <Scene key={PageKeys.DrawingClassifier} component={DrawingClassifier} />
                  </Scene>
              </Drawer>
            </Router>
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