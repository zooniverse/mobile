import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import Onboarding from '../Onboarding'

jest.mock('ImageBackground')
jest.useFakeTimers();

it('renders', () => {
  const tree = renderer.create(
    <Onboarding />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
