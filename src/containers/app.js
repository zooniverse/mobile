import React, {Component} from 'react'
import { AppState, NetInfo } from 'react-native'
import { createStore, applyMiddleware, compose } from 'redux'
import { Provider } from 'react-redux'
import reducer from '../reducers/index'
import thunkMiddleware from 'redux-thunk'
import {Scene, Router} from 'react-native-router-flux'
import { setIsConnected, loadUserData, fetchProjects } from '../actions/index'

import ZooniverseApp from './zooniverseApp'
import ProjectList from '../components/ProjectList'
import ProjectDisciplines from '../components/ProjectDisciplines'
import About from '../components/About'
import PublicationList from '../components/PublicationList'
import SignIn from '../components/SignIn'
import SideDrawer from '../components/SideDrawer'

const store = compose(applyMiddleware(thunkMiddleware))(createStore)(reducer)

export default class App extends Component {
  componentDidMount() {
    store.dispatch(loadUserData())

    const handleAppStateChange = currentAppState => {
      if (currentAppState === 'active') {
        store.dispatch(loadUserData())
      }
    }
    AppState.addEventListener('change', handleAppStateChange)

    const dispatchConnected = isConnected => store.dispatch(setIsConnected(isConnected))
    NetInfo.isConnected.fetch().then(isConnected => {
      store.dispatch(setIsConnected(isConnected))
      NetInfo.isConnected.addEventListener('change', dispatchConnected)
    })

    store.dispatch(fetchProjects())
  }

  render() {
    return (
      <Provider store={store}>
        <Router ref="router">
          <Scene ref="drawer" key="drawer" component={SideDrawer} open={false}>
            <Scene key="main" tabs={false} >
              <Scene key="SignIn" hideNavBar={true} component={SignIn} type="reset" />
              <Scene key="ZooniverseApp" component={ZooniverseApp} initial />
              <Scene key="ProjectDisciplines" component={ProjectDisciplines} />
              <Scene key="About" component={About} />
              <Scene key="Publications" component={PublicationList} />
              <Scene key="ProjectList" component={ProjectList} />
            </Scene>
          </Scene>
        </Router>
      </Provider>
    );
  }
}
