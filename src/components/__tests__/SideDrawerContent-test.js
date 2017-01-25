import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import { SideDrawerContent } from '../SideDrawerContent'

it('renders correctly', () => {
  const tree = renderer.create(
    <SideDrawerContent />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
