import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'

jest.mock('../SideDrawerContent', () => 'SideDrawerContent')

jest.mock('react-native-router-flux', () => ({
  Actions: 'Field',
  DefaultRenderer: 'DefaultRenderer',
}))

import SideDrawer from '../SideDrawer'

it('renders correctly', () => {
  const navigationState = {
    children: [{ }],
    open: true
  }

  const tree = renderer.create(
    <SideDrawer navigationState={navigationState} onNavigate={jest.fn}/>
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
