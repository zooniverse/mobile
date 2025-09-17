import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import ZooIcon from '../ZooIcon'

it('renders correctly', () => {
  const tree = renderer.create(
    <ZooIcon iconName={'nature'} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
