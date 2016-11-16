import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import StyledText from '../StyledText'

it('renders text correctly', () => {
  const tree = renderer.create(
    <StyledText text={'O Hai!'} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders styles as array when style passed in', () => {
  const tree = renderer.create(
    <StyledText text={'O Hai!'}  textStyle={'test'} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
