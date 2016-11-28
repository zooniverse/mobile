import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import Discipline from '../Discipline'

it('renders with a title', () => {
  const tree = renderer.create(
    <Discipline
      title='O Hai!'
      icon='arts'
      tag='test'
      color='#fff'
      setSelectedProjectTag={jest.fn} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
