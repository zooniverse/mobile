import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import FieldGuideItemDetail from '../FieldGuideItemDetail'

jest.mock('../../SizedImage', () => 'SizedImage');
jest.mock('WebView', () => 'WebView');

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
    <FieldGuideItemDetail item={item} icons={icons} onClose={jest.fn} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
