import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import Checkbox from '../Checkbox'

it('renders', () => {
  const tree = renderer.create(
    <Checkbox />
  ).toJSON();
  expect(tree).toMatchSnapshot()
})

it('renders background color when checked', () => {
  const tree = renderer.create(
    <Checkbox selected={true}/>
  ).toJSON();
  expect(tree).toMatchSnapshot()
})
