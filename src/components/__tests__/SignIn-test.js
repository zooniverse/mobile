import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import { SignIn } from '../SignIn'

it('renders correctly', () => {
  const tree = renderer.create(
    <SignIn isConnected={true} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders error message', () => {
  const tree = renderer.create(
    <SignIn isConnected={true} errorMessage={'does not compute'} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
