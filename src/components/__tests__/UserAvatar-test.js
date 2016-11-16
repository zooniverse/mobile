import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import UserAvatar from '../UserAvatar'

it('renders correctly', () => {
  const tree = renderer.create(
    <UserAvatar avatar={'avatar'}/>
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
