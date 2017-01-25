import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import Publication from '../Publication'

const publication = {
  citation: 'Nice citation'
}

it('renders correctly', () => {
  const tree = renderer.create(
    <Publication publication={publication} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
