import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import About from '../About'
import { Provider } from 'react-redux'
import { createStore } from 'redux'

const store = createStore(() => {}, ['test'])

it('renders correctly', () => {
  const tree = renderer.create(
    <Provider store={store} >
      <About setNavbarSettingsForPage={()=>{}}/>
    </Provider>
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
