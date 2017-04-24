import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
jest.mock('../Button', () => 'Button')
import FieldGuide from '../FieldGuide'

const guide = {
  items: [
    {
      title: 'fake_avatar',
      content: 'Nice project',
      icon: '12345',
    },
    {
      title: 'fake_avatar2',
      content: 'Another Nice project',
      icon: '123456',
    },
  ],
  icons:{
    '12345': { src: 'fake_icon.jpg' },
    '123456': { src: 'fake_icon.jpg' }
  }
}

it('renders correctly', () => {
  const tree = renderer.create(
    <FieldGuide
      guide={guide}
      isVisible={true}
      handlePress={jest.fn}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
