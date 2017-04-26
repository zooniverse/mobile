import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import FullScreenImage from '../FullScreenImage'

const imageSource = {
  uri: 'https://placekitten.com/200/300'
}

it('renders correctly', () => {
  const tree = renderer.create(
    <FullScreenImage
      source={imageSource}
      handlePress={jest.fn}
      isVisible={true}
      allowPanAndZoom={true}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders hidden correctly', () => {
  const tree = renderer.create(
    <FullScreenImage
      source={imageSource}
      handlePress={jest.fn}
      isVisible={false}
      allowPanAndZoom={true}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
