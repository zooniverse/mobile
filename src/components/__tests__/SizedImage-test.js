import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import SizedImage from '../SizedImage'

const source = {
  uri: 'https://placekitten.com/200/300'
}

it('renders', () => {
  const tree = renderer.create(
    <SizedImage
      source={source}
      additionalStyles={[]}
    />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
