import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import ZoomableImage from '../ZoomableImage'

const imageSource = {
  uri: 'https://placekitten.com/200/300'
}

it('renders correctly', () => {
  const tree = renderer.create(
    <ZoomableImage
      source={imageSource}
      handlePress={jest.fn}
      imageWidth={100}
      imageHeight={200}
      allowPanAndZoom={true}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
