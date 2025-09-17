import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'

import FieldGuideItemRow from '../FieldGuideItemRow'

const item = {
  title: 'fake_avatar',
  content: 'Nice project',
  icon: '12345',
}

const icons = {
  '12345': {
   src: 'fake_icon.jpg',
  }
}

it('renders correctly', () => {
  const tree = renderer.create(
    <FieldGuideItemRow item={item} icons={icons} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
