import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import Button from '../Button'

it('renders button text correctly', () => {
  const tree = renderer.create(
    <Button text={'O Hai!'} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders TouchableOpacity disabled when passed in', () => {
  const tree = renderer.create(
    <Button disabled={true} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders styles as array when special style is passed in', () => {
  const tree = renderer.create(
    <Button buttonStyle={'hai'} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
