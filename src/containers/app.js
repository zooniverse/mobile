import React, {Component} from 'react'
import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension';
import { AppState, NetInfo } from 'react-native'
import { Provider } from 'react-redux'
import reducer from '../reducers/index'
import thunkMiddleware from 'redux-thunk'
import {Scene, Router, Drawer} from 'react-native-router-flux'
import { setIsConnected, setState } from '../actions/index'
import { fetchProjects } from '../actions/projects'
import { loadUserData } from '../actions/user'
import { setSession } from '../actions/session'

import ZooniverseApp from './zooniverseApp'
import ProjectList from '../components/ProjectList'
import ProjectDisciplines from '../components/ProjectDisciplines'
import About from '../components/About'
import PublicationList from '../components/PublicationList'
import SignIn from '../components/SignIn'
import Register from '../components/Register'
import Settings from '../components/Settings'
import SideDrawerContent from '../components/SideDrawerContent'
import ZooWebView from '../components/ZooWebView'
import Onboarding from '../components/Onboarding'
import SwipeClassifier from '../components/SwipeClassifier'

const store = createStore(reducer, composeWithDevTools(applyMiddleware(thunkMiddleware)))

export default class App extends Component {
  componentDidMount() {
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
    store.dispatch(fetchProjects())
  }

  render() {
    return (
      <Provider store={store}>
        <Router>
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
              <Scene key="ZooWebView" hideNavBar={true} component={ZooWebView} duration={0} navBar={ZooWebView.renderNavigationBar} />
              <Scene key="Onboarding" component={Onboarding} duration={0} hideNavBar={true} />
              <Scene key="SwipeClassifier" component={SwipeClassifier} panHandlers={null} navBar={SwipeClassifier.renderNavigationBar}/>
            </Scene>
          </Drawer>
        </Router>
      </Provider>
    );
  }
}
