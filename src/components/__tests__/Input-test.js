import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import Input from '../Input'


it('renders with no label', () => {
  const tree = renderer.create(
    <Input />
  ).toJSON();
  expect(tree).toMatchSnapshot()
})

it('renders a label correctly', () => {
  const tree = renderer.create(
    <Input labelText={'Ermahgerd Berks'}/>
  ).toJSON();
  expect(tree).toMatchSnapshot()
})

it('renders password fields (using secureTextEntry)', () => {
  const tree = renderer.create(
    <Input passwordField={true}/>
  ).toJSON();
  expect(tree).toMatchSnapshot()
})
