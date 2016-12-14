import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import { Register } from '../Register'

it('renders correctly', () => {
  const tree = renderer.create(
    <Register
      isFetching={false}
      register={() => {}}
      setField={() => {}}
      setError={() => {}}
      registration={{}} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders errors', () => {
  const tree = renderer.create(
    <Register
      isFetching={false}
      register={() => {}}
      setField={() => {}}
      setError={() => {}}
      registration={{}}
      errorMessage={'Wrong!'} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
