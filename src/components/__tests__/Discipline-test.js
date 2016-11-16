import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import Discipline from '../Discipline'

it('renders with a title', () => {
  const tree = renderer.create(
    <Discipline title='O Hai!' />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
