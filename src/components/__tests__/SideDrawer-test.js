import 'react-native'
import React from 'react'
import ShallowRenderer from 'react-test-renderer/shallow';
import SideDrawer from '../SideDrawer'

it('renders correctly', () => {
  const navigationState = {
    children: [{ }],
    open: true
  }

  const renderer = new ShallowRenderer();

  const tree = renderer.render(
    <SideDrawer navigationState={navigationState} onNavigate={jest.fn}/>
  )
  expect(tree).toMatchSnapshot()
})
