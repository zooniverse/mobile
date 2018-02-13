import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import SizedImage from '../SizedImage'

jest.useFakeTimers();

jest.mock('Image', () => {
  const React = require('react');
  class MockImage extends React.Component {

    static getSize() {
      return 40;
    }
  
    render() {
      return null;
    }
  }
  return MockImage
});

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
