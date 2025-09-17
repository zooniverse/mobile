import 'react-native'
import React from 'react'
import ShallowRenderer from 'react-test-renderer/shallow';
import FullScreenMedia from '../FullScreenMedia'

const imageSource = {
  uri: 'https://placekitten.com/200/300'
}

jest.mock('../ZoomableMedia', () => 'ZoomableImage')

const renderer = new ShallowRenderer();

it('renders correctly', () => {
  const tree = renderer.render(
    <FullScreenMedia
      source={imageSource}
      handlePress={jest.fn}
      isVisible={true}
      allowPanAndZoom={true}
    />
  )
  expect(tree).toMatchSnapshot()
})

it('renders hidden correctly', () => {
  const tree = renderer.render(
    <FullScreenMedia
      source={imageSource}
      handlePress={jest.fn}
      isVisible={false}
      allowPanAndZoom={true}
    />
  )
  expect(tree).toMatchSnapshot()
})
