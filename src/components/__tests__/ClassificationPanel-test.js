import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import ClassificationPanel from '../ClassificationPanel'

it('renders correctly', () => {
  const tree = renderer.create(
    <ClassificationPanel />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
