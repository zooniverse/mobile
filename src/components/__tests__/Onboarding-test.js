import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import Onboarding from '../Onboarding'

it('renders', () => {
  const tree = renderer.create(
    <Onboarding />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
