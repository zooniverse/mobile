import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import Button from '../Button'

it('renders button text correctly', () => {
  const tree = renderer.create(
    <Button text={'O Hai!'} handlePress={jest.fn} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders TouchableOpacity disabled when passed in', () => {
  const tree = renderer.create(
    <Button disabled={true} handlePress={jest.fn} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders styles as array when special style is passed in', () => {
  const tree = renderer.create(
    <Button buttonStyle={'hai'} handlePress={jest.fn} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
